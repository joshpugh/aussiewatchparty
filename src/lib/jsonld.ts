/**
 * Builders for schema.org JSON-LD blobs injected on match + party pages.
 * Helps Google generate rich results for events and improves how share
 * platforms understand the content.
 */
import type { Match } from '@/lib/db/schema';
import type { PartyWithMatch } from '@/lib/parties';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aussiewatchparty.com';

/**
 * Builds the SportsEvent body for a match. Used both as the top-level
 * JSON-LD on /match/[id] AND embedded as the `superEvent` on every party
 * page so Google can connect the watch-party Event to its parent match.
 */
function buildMatchSchema(m: Match) {
  const url = `${SITE_URL}/match/${m.id}`;

  // SportsEvent requires `location`. Build the richest object we have from
  // whatever's available: stadium > city > country. Always returns a Place
  // so the schema is structurally valid even before full venue data.
  const placeName = m.venueStadium ?? m.venueCity ?? 'TBD';
  const addressParts: Record<string, string> = {};
  if (m.venueCity) addressParts.addressLocality = m.venueCity;
  if (m.venueRegion) addressParts.addressRegion = m.venueRegion;
  if (m.venueCountry) addressParts.addressCountry = m.venueCountry;
  const location = {
    '@type': 'Place' as const,
    name: placeName,
    address: {
      '@type': 'PostalAddress' as const,
      ...addressParts,
    },
  };

  // Soccer matches are typically ~110 minutes including stoppage; round up
  // to 2h so the event window covers most outcomes.
  const endDate = new Date(m.kickoffUtc.getTime() + 2 * 60 * 60 * 1000);

  return {
    '@type': 'SportsEvent' as const,
    name: `Australia vs ${m.opponent}`,
    description: `${m.stage === 'group' ? 'Group D' : 'Knockout'} match: Australia vs ${m.opponent}.${m.notes ? ` ${m.notes}` : ''}`,
    sport: 'Association Football',
    startDate: m.kickoffUtc.toISOString(),
    endDate: endDate.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    url,
    image: `${url}/opengraph-image`,
    location,
    homeTeam: { '@type': 'SportsTeam' as const, name: 'Australia' },
    awayTeam: { '@type': 'SportsTeam' as const, name: m.opponent },
    competitor: [
      { '@type': 'SportsTeam' as const, name: 'Australia (Socceroos)' },
      { '@type': 'SportsTeam' as const, name: m.opponent },
    ],
    organizer: {
      '@type': 'Organization' as const,
      name: 'FIFA',
      url: 'https://www.fifa.com/',
    },
  };
}

export function matchJsonLd(m: Match) {
  return {
    '@context': 'https://schema.org',
    ...buildMatchSchema(m),
  };
}

export function partyJsonLd(p: PartyWithMatch) {
  const url = `${SITE_URL}/parties/${p.slug}`;
  // Soccer matches typically last ~2h with stoppage time; close the
  // watch-party event window at the same offset so calendar tools can
  // schedule it cleanly.
  const endDate = new Date(p.match.kickoffUtc.getTime() + 2 * 60 * 60 * 1000);

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Watch party: AUS vs ${p.match.opponent} at ${p.venueName}`,
    description:
      p.hostNotes ??
      `Public watch party for the Socceroos match against ${p.match.opponent} at ${p.venueName} in ${p.city}, ${p.state}.`,
    startDate: p.match.kickoffUtc.toISOString(),
    endDate: endDate.toISOString(),
    url,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: `${url}/opengraph-image`,
    location: {
      '@type': 'Place',
      name: p.venueName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: p.addressLine,
        addressLocality: p.city,
        addressRegion: p.state,
        postalCode: p.zip,
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: p.lat,
        longitude: p.lng,
      },
    },
    organizer: {
      '@type': 'Organization',
      name: p.venueName,
      url: p.websiteUrl ?? undefined,
      email: p.contactEmail ?? undefined,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      // Point at the external booking platform when set, otherwise our
      // own party page (which hosts the RSVP form).
      url: p.rsvpUrl ?? url,
      validFrom: p.createdAt.toISOString(),
    },
    maximumAttendeeCapacity: p.capacity ?? undefined,
    // Full SportsEvent (incl. its own required `location`) so Google can
    // validate the nested event and connect the watch party to the match.
    superEvent: buildMatchSchema(p.match),
  };
}
