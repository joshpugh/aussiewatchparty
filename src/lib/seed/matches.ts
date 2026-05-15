import type { NewMatch } from '@/lib/db/schema';

/**
 * Socceroos 2026 fixtures — Group D.
 *
 * Confirmed Group D opponents: Türkiye, USA, Paraguay.
 *
 * Kickoff times are stored in UTC. The UI localises them via
 * `Intl.DateTimeFormat` in the visitor's timezone.
 *
 * Country codes are ISO-3166-1 alpha-2 ("US", "CA"). The stadium + region
 * fields drive the schema.org SportsEvent JSON-LD on /match/[id].
 *
 * Source: Football Australia announcement (2025-12-05).
 *
 * `id` is a stable slug — never change it once parties reference it.
 * Re-run `npm run db:seed` after editing.
 */
export const SOCCEROOS_MATCHES: NewMatch[] = [
  {
    id: 'aus-group-1',
    opponent: 'Türkiye',
    stage: 'group',
    // Sat Jun 13, 9:00 PM PT — BC Place, Vancouver
    kickoffUtc: new Date('2026-06-14T04:00:00Z'),
    venueStadium: 'BC Place',
    venueCity: 'Vancouver',
    venueRegion: 'BC',
    venueCountry: 'CA',
    notes: 'BC Place, Vancouver. Türkiye qualified via UEFA Play-off C.',
    isTbd: false,
  },
  {
    id: 'aus-group-2',
    opponent: 'USA',
    stage: 'group',
    // Fri Jun 19, 12:00 PM PT — Lumen Field, Seattle
    kickoffUtc: new Date('2026-06-19T19:00:00Z'),
    venueStadium: 'Lumen Field',
    venueCity: 'Seattle',
    venueRegion: 'WA',
    venueCountry: 'US',
    notes: 'Lumen Field (Seattle Stadium). Host-nation match.',
    isTbd: false,
  },
  {
    id: 'aus-group-3',
    opponent: 'Paraguay',
    stage: 'group',
    // Thu Jun 25, 7:00 PM PT — Levi's Stadium, Santa Clara
    kickoffUtc: new Date('2026-06-26T02:00:00Z'),
    venueStadium: 'Levi’s Stadium',
    venueCity: 'Santa Clara',
    venueRegion: 'CA',
    venueCountry: 'US',
    notes: 'Levi’s Stadium (San Francisco Bay Area Stadium).',
    isTbd: false,
  },
];
