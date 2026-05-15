import 'server-only';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parties, matches, type Party, type Match } from '@/lib/db/schema';
import { haversineMiles } from '@/lib/geo/distance';

export type PartyWithMatch = Party & { match: Match };
export type PartyWithDistance = PartyWithMatch & { distanceMi: number };

/** Default "near you" radius in miles. */
export const NEAR_RADIUS_MI = 75;

export async function listPublishedParties(): Promise<PartyWithMatch[]> {
  const rows = await db
    .select()
    .from(parties)
    .innerJoin(matches, eq(parties.matchId, matches.id))
    .where(eq(parties.status, 'published'))
    .orderBy(asc(matches.kickoffUtc));
  return rows.map((r) => ({ ...r.parties, match: r.matches }));
}

/**
 * Splits all published parties into `near` (within `radiusMi` of the
 * origin, sorted by distance) and `elsewhere` (all the rest, also sorted
 * by distance). The map still gets the whole list; the UI groups them
 * so "near" isn't misleading.
 */
export async function partiesNearGrouped(
  origin: { lat: number; lng: number },
  radiusMi = NEAR_RADIUS_MI,
): Promise<{ near: PartyWithDistance[]; elsewhere: PartyWithDistance[]; radiusMi: number }> {
  const all = await listPublishedParties();
  const withDist = all
    .map((p) => ({ ...p, distanceMi: haversineMiles(origin, p) }))
    .sort((a, b) => a.distanceMi - b.distanceMi);
  const near = withDist.filter((p) => p.distanceMi <= radiusMi);
  const elsewhere = withDist.filter((p) => p.distanceMi > radiusMi);
  return { near, elsewhere, radiusMi };
}

export async function partyBySlug(slug: string): Promise<PartyWithMatch | null> {
  const rows = await db
    .select()
    .from(parties)
    .innerJoin(matches, eq(parties.matchId, matches.id))
    .where(and(eq(parties.slug, slug), eq(parties.status, 'published')))
    .limit(1);
  if (rows.length === 0) return null;
  return { ...rows[0].parties, match: rows[0].matches };
}

export async function partiesForMatch(matchId: string): Promise<PartyWithMatch[]> {
  const rows = await db
    .select()
    .from(parties)
    .innerJoin(matches, eq(parties.matchId, matches.id))
    .where(and(eq(parties.matchId, matchId), eq(parties.status, 'published')));
  return rows.map((r) => ({ ...r.parties, match: r.matches }));
}
