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
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `Australia vs ${m.opponent}`,
    description: `${m.stage === 'group' ? 'Group D' : 'Knockout'} match: Australia vs ${m.opponent}.${m.notes ? ` ${m.notes}` : ''}`,
    sport: 'Association Football',
    startDate: m.kickoffUtc.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    url,
    location: m.venueCity
      ? {
          '@type': 'Place',
          name: m.venueCity,
          address: {
            '@type': 'PostalAddress',
            addressLocality: m.venueCity,
            addressCountry: m.venueCountry ?? undefined,
          },
        }
      : undefined,
    competitor: [
      { '@type': 'SportsTeam', name: 'Australia (Socceroos)' },
      { '@type': 'SportsTeam', name: m.opponent },
    ],
    organizer: { '@type': 'Organization', name: 'FIFA' },
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
