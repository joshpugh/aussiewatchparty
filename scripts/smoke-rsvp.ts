/**
 * End-to-end RSVP smoke test against the locally-running dev server.
 *
 *   npm run smoke
 *
 * Inserts a temporary test party (or reuses an existing one), POSTs an RSVP
 * to /api/rsvp, and prints the result. The RSVP handler will send a real
 * confirmation email via Resend if RESEND_API_KEY + RESEND_FROM are set.
 *
 * Cleanup: the test party is left in the DB so you can see it on the homepage.
 * Re-runs are idempotent — they reuse the same test party by slug.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import * as schema from '../src/lib/db/schema';

const TEST_TO = process.argv[2] ?? 'josh@americajosh.com';
const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';
const TEST_SLUG = 'smoke-test-pub-newark';

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error('TURSO_DATABASE_URL not set');
  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  // 1. Make sure we have a party to RSVP to.
  const existing = await db
    .select()
    .from(schema.parties)
    .where(eq(schema.parties.slug, TEST_SLUG))
    .limit(1);

  let partyId: string;
  if (existing.length === 0) {
    partyId = randomBytes(8).toString('base64url');
    console.log('Creating test party…');
    await db.insert(schema.parties).values({
      id: partyId,
      slug: TEST_SLUG,
      matchId: 'aus-group-1',
      venueName: 'The Smoke Test Pub',
      venueLogoUrl: null,
      addressLine: '1 Penn Plaza',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      lat: 40.7506,
      lng: -73.9935,
      hostNotes: 'This is a synthetic party created by scripts/smoke-rsvp.ts.',
      capacity: null,
      contactEmail: null,
      websiteUrl: null,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    partyId = existing[0].id;
    console.log(`Reusing test party ${partyId}.`);
  }

  // 2. POST an RSVP.
  console.log(`POST ${BASE}/api/rsvp → ${TEST_TO}`);
  const res = await fetch(`${BASE}/api/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partyId,
      name: 'Smoke Tester',
      email: TEST_TO,
      partySize: 2,
      consent: true,
    }),
  });
  const text = await res.text();
  console.log(`HTTP ${res.status} — ${text}`);

  if (!res.ok) {
    process.exit(1);
  }

  // 3. Show whether the email was marked sent.
  const recent = await db
    .select()
    .from(schema.rsvps)
    .where(eq(schema.rsvps.email, TEST_TO))
    .orderBy(schema.rsvps.createdAt)
    .limit(10);
  const last = recent[recent.length - 1];
  console.log('Latest RSVP row:');
  console.log({
    id: last.id,
    confirmationSentAt: last.confirmationSentAt,
    createdAt: last.createdAt,
  });

  if (last.confirmationSentAt) {
    console.log('\n✓ Confirmation email was sent. Check your inbox.');
  } else {
    console.log(
      '\n⚠ RSVP saved but confirmation_sent_at is null — check dev server logs for the Resend error.',
    );
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
