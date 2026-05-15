import type { NewMatch } from '@/lib/db/schema';

/**
 * Socceroos 2026 fixtures — Group D.
 *
 * Confirmed Group D opponents: USA, Paraguay, and the winner of UEFA
 * Play-off C (Türkiye, Romania, Slovakia, or Kosovo). The first match
 * has `isTbd: true` until the play-off winner is decided.
 *
 * Kickoff times are stored in UTC. The UI localises them via
 * `Intl.DateTimeFormat` in the visitor's timezone.
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
    venueCity: 'Vancouver',
    venueCountry: 'Canada',
    notes: 'BC Place. Türkiye qualified via UEFA Play-off C.',
    isTbd: false,
  },
  {
    id: 'aus-group-2',
    opponent: 'USA',
    stage: 'group',
    // Fri Jun 19, 12:00 PM PT — Seattle Stadium, Seattle
    kickoffUtc: new Date('2026-06-19T19:00:00Z'),
    venueCity: 'Seattle',
    venueCountry: 'USA',
    notes: 'Seattle Stadium (Lumen Field). Host nation match.',
    isTbd: false,
  },
  {
    id: 'aus-group-3',
    opponent: 'Paraguay',
    stage: 'group',
    // Thu Jun 25, 7:00 PM PT — San Francisco Bay Area Stadium, Santa Clara
    kickoffUtc: new Date('2026-06-26T02:00:00Z'),
    venueCity: 'Santa Clara',
    venueCountry: 'USA',
    notes: 'San Francisco Bay Area Stadium (Levi’s Stadium).',
    isTbd: false,
  },
];
