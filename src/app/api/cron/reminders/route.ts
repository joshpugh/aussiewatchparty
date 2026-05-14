import { NextResponse } from 'next/server';
import { and, eq, gt, isNull, lt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { rsvps, parties, matches } from '@/lib/db/schema';
import { sendReminder } from '@/lib/email/send';

/**
 * Runs hourly via Vercel Cron (see vercel.json).
 * Finds RSVPs whose match kicks off in the next ~25h and that haven't been
 * reminded yet, sends a reminder, and marks them as sent.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = req.headers.get('authorization') ?? '';
    if (header !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const now = new Date();
  const max = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const min = new Date(now.getTime() + 23 * 60 * 60 * 1000);

  const rows = await db
    .select()
    .from(rsvps)
    .innerJoin(parties, eq(rsvps.partyId, parties.id))
    .innerJoin(matches, eq(parties.matchId, matches.id))
    .where(
      and(
        isNull(rsvps.reminderSentAt),
        gt(matches.kickoffUtc, min),
        lt(matches.kickoffUtc, max),
      ),
    );

  let sent = 0;
  let failed = 0;

  for (const r of rows) {
    try {
      await sendReminder(r.rsvps, r.parties, r.matches);
      await db
        .update(rsvps)
        .set({ reminderSentAt: new Date() })
        .where(eq(rsvps.id, r.rsvps.id));
      sent++;
    } catch (err) {
      console.error('Reminder send failed', err);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, considered: rows.length, sent, failed });
}
