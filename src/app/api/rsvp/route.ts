import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { parties, matches, rsvps } from '@/lib/db/schema';
import { sendConfirmation } from '@/lib/email/send';

const Schema = z.object({
  partyId: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  partySize: z.number().int().min(1).max(50),
  consent: z.literal(true, { message: 'Please tick the consent box to RSVP.' }),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 400 },
    );
  }
  const { partyId, name, email, partySize } = parsed.data;

  // Verify party exists + load match
  const rows = await db
    .select()
    .from(parties)
    .innerJoin(matches, eq(parties.matchId, matches.id))
    .where(eq(parties.id, partyId))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'That party no longer exists.' }, { status: 404 });
  }
  const party = rows[0].parties;
  const match = rows[0].matches;

  const id = randomBytes(12).toString('base64url');
  const rsvp = {
    id,
    partyId,
    name,
    email,
    partySize,
    consent: true,
    confirmationSentAt: null as Date | null,
    reminderSentAt: null as Date | null,
    createdAt: new Date(),
  };

  await db.insert(rsvps).values(rsvp);

  // Best-effort email; don't fail the request if email is down.
  try {
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
      await sendConfirmation({ ...rsvp }, party, match);
      await db
        .update(rsvps)
        .set({ confirmationSentAt: new Date() })
        .where(eq(rsvps.id, id));
    }
  } catch (err) {
    console.error('Confirmation email failed', err);
  }

  return NextResponse.json({ ok: true });
}
