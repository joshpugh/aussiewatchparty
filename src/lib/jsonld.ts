/**
 * Builders for schema.org JSON-LD blobs injected on match + party pages.
 * Helps Google generate rich results for events and improves how share
 * platforms understand the content.
 */
import type { Match } from '@/lib/db/schema';
import type { PartyWithMatch } from '@/lib/parties';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aussiewatchparty.com';

export function matchJsonLd(m: Match) {
  const url = `${SITE_URL}/match/${m.id}`;

  // SportsEvent requires `location`. Build the richest object we can from
  // whatever we have: stadium > city > country. Always returns a Place so
  // the schema is structurally valid even before we have full venue data.
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
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
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
    homeTeam: { '@type': 'SportsTeam', name: 'Australia' },
    awayTeam: { '@type': 'SportsTeam', name: m.opponent },
    competitor: [
      { '@type': 'SportsTeam', name: 'Australia (Socceroos)' },
      { '@type': 'SportsTeam', name: m.opponent },
    ],
    organizer: {
      '@type': 'Organization',
      name: 'FIFA',
      url: 'https://www.fifa.com/',
    },
  };
}

export function partyJsonLd(p: PartyWithMatch) {
  const url = `${SITE_URL}/parties/${p.slug}`;
  const matchUrl = `${SITE_URL}/match/${p.match.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Watch party: AUS vs ${p.match.opponent} at ${p.venueName}`,
    description:
      p.hostNotes ??
      `Public watch party for the Socceroos match against ${p.match.opponent} at ${p.venueName} in ${p.city}, ${p.state}.`,
    startDate: p.match.kickoffUtc.toISOString(),
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
      url,
      validFrom: p.createdAt.toISOString(),
    },
    maximumAttendeeCapacity: p.capacity ?? undefined,
    superEvent: {
      '@type': 'SportsEvent',
      name: `Australia vs ${p.match.opponent}`,
      url: matchUrl,
      startDate: p.match.kickoffUtc.toISOString(),
    },
  };
}
