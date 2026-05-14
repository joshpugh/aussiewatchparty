/**
 * One-shot: download GeoNames US ZIP centroids and insert into Turso.
 *
 *   npm run db:seed-zips
 *
 * Source: https://download.geonames.org/export/zip/US.zip  (Creative Commons)
 * Requires `unzip` on PATH (macOS / Linux ship it; Windows users: install it
 * via WSL or 7zip).
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
config();
import { execFileSync } from 'node:child_process';
import { createReadStream, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createInterface } from 'node:readline';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/lib/db/schema';

const URL = 'https://download.geonames.org/export/zip/US.zip';

async function main() {
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const dbToken = process.env.TURSO_AUTH_TOKEN;
  if (!dbUrl) throw new Error('TURSO_DATABASE_URL not set');

  const dir = mkdtempSync(join(tmpdir(), 'swp-zips-'));
  const zipPath = join(dir, 'US.zip');
  const txtPath = join(dir, 'US.txt');

  console.log(`Downloading ${URL}…`);
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(zipPath, buf);
  console.log(`  ${(buf.length / 1024 / 1024).toFixed(1)} MB downloaded.`);

  console.log('Unzipping…');
  execFileSync('unzip', ['-o', zipPath, '-d', dir], { stdio: 'inherit' });

  const client = createClient({ url: dbUrl, authToken: dbToken });
  const db = drizzle(client, { schema });

  console.log('Reading rows…');
  const rl = createInterface({ input: createReadStream(txtPath) });
  const batch: (typeof schema.zipCentroids.$inferInsert)[] = [];
  const BATCH = 500;
  let total = 0;

  async function flush() {
    if (batch.length === 0) return;
    await db
      .insert(schema.zipCentroids)
      .values(batch)
      .onConflictDoNothing();
    total += batch.length;
    batch.length = 0;
    process.stdout.write(`\r  inserted ${total}…`);
  }

  for await (const line of rl) {
    const cols = line.split('\t');
    if (cols.length < 11) continue;
    const [, zip, place, , state, , , , , lat, lng] = cols;
    if (!/^\d{5}$/.test(zip)) continue;
    const latN = Number(lat);
    const lngN = Number(lng);
    if (!Number.isFinite(latN) || !Number.isFinite(lngN)) continue;
    batch.push({ zip, city: place || null, state: state || null, lat: latN, lng: lngN });
    if (batch.length >= BATCH) await flush();
  }
  await flush();
  console.log(`\nDone. ${total} ZIPs imported.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
