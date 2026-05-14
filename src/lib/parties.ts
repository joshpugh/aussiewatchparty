import 'server-only';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parties, matches, type Party, type Match } from '@/lib/db/schema';
import { haversineMiles } from '@/lib/geo/distance';

export type PartyWithMatch = Party & { match: Match };
export type PartyWithDistance = PartyWithMatch & { distanceMi: number };

export async function listPublishedParties(): Promise<PartyWithMatch[]> {
  const rows = await db
    .select()
    .from(parties)
    .innerJoin(matches, eq(parties.matchId, matches.id))
    .where(eq(parties.isPublished, true))
    .orderBy(asc(matches.kickoffUtc));
  return rows.map((r) => ({ ...r.parties, match: r.matches }));
}

export async function partiesNear(
  origin: { lat: number; lng: number },
  limit = 12,
): Promise<PartyWithDistance[]> {
  const all = await listPublishedParties();
  return all
    .map((p) => ({ ...p, distanceMi: haversineMiles(origin, p) }))
    .sort((a, b) => a.distanceMi - b.distanceMi)
    .slice(0, limit);
}

export async function partyBySlug(slug: string): Promise<PartyWithMatch | null> {
  const rows = await db
    .select()
    .from(parties)
    .innerJoin(matches, eq(parties.matchId, matches.id))
    .where(and(eq(parties.slug, slug), eq(parties.isPublished, true)))
    .limit(1);
  if (rows.length === 0) return null;
  return { ...rows[0].parties, match: rows[0].matches };
}

export async function partiesForMatch(matchId: string): Promise<PartyWithMatch[]> {
  const rows = await db
    .select()
    .from(parties)
    .innerJoin(matches, eq(parties.matchId, matches.id))
    .where(and(eq(parties.matchId, matchId), eq(parties.isPublished, true)));
  return rows.map((r) => ({ ...r.parties, match: r.matches }));
}
