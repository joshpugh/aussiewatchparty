import type { NewMatch } from '@/lib/db/schema';

/**
 * Socceroos 2026 fixtures.
 *
 * These are placeholders until the draw + kickoff times are finalised.
 * To replace: edit this file, set `isTbd: false` for confirmed matches,
 * and re-run `npm run db:seed`.
 *
 * `id` is a stable slug — never change it once a match is referenced by
 * existing parties.
 */
export const SOCCEROOS_MATCHES: NewMatch[] = [
  {
    id: 'aus-group-1',
    opponent: 'TBD (Group opponent 1)',
    stage: 'group',
    kickoffUtc: new Date('2026-06-13T19:00:00Z'),
    venueCity: 'TBD',
    venueCountry: 'USA',
    notes: 'Opening group match. Date/time placeholder — update once the draw is published.',
    isTbd: true,
  },
  {
    id: 'aus-group-2',
    opponent: 'TBD (Group opponent 2)',
    stage: 'group',
    kickoffUtc: new Date('2026-06-19T19:00:00Z'),
    venueCity: 'TBD',
    venueCountry: 'USA',
    notes: 'Second group match. Placeholder.',
    isTbd: true,
  },
  {
    id: 'aus-group-3',
    opponent: 'TBD (Group opponent 3)',
    stage: 'group',
    kickoffUtc: new Date('2026-06-25T19:00:00Z'),
    venueCity: 'TBD',
    venueCountry: 'USA',
    notes: 'Final group match. Placeholder.',
    isTbd: true,
  },
];
