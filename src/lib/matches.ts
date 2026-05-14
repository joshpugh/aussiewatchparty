import 'server-only';
import { asc, eq, gt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { matches, type Match } from '@/lib/db/schema';

export async function listMatches(): Promise<Match[]> {
  return db.select().from(matches).orderBy(asc(matches.kickoffUtc));
}

export async function nextMatch(): Promise<Match | null> {
  const rows = await db
    .select()
    .from(matches)
    .where(gt(matches.kickoffUtc, new Date()))
    .orderBy(asc(matches.kickoffUtc))
    .limit(1);
  return rows[0] ?? null;
}

export async function matchById(id: string): Promise<Match | null> {
  const rows = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
  return rows[0] ?? null;
}
