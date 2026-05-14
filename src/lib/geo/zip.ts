import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { zipCentroids } from '@/lib/db/schema';

export type ZipLookup = {
  zip: string;
  lat: number;
  lng: number;
  city: string | null;
  state: string | null;
};

export async function lookupZip(zip: string): Promise<ZipLookup | null> {
  const trimmed = zip.trim().slice(0, 5);
  if (!/^\d{5}$/.test(trimmed)) return null;
  const rows = await db
    .select()
    .from(zipCentroids)
    .where(eq(zipCentroids.zip, trimmed))
    .limit(1);
  return rows[0] ?? null;
}
