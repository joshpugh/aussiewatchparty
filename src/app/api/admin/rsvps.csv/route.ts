import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { rsvps, parties, matches } from '@/lib/db/schema';
import { isAuthed } from '@/lib/auth/admin';

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  if (!(await isAuthed())) return new Response('Unauthorized', { status: 401 });
  const url = new URL(req.url);
  const partyId = url.searchParams.get('party');

  const q = db
    .select({ r: rsvps, p: parties, m: matches })
    .from(rsvps)
    .innerJoin(parties, eq(rsvps.partyId, parties.id))
    .innerJoin(matches, eq(parties.matchId, matches.id))
    .orderBy(desc(rsvps.createdAt));

  const rows = partyId ? await q.where(eq(rsvps.partyId, partyId)) : await q;

  const header = [
    'rsvp_id',
    'created_at',
    'name',
    'email',
    'party_size',
    'venue',
    'city',
    'state',
    'zip',
    'match_opponent',
    'kickoff_utc',
    'confirmation_sent_at',
    'reminder_sent_at',
  ];

  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.r.id,
        new Date(row.r.createdAt).toISOString(),
        row.r.name,
        row.r.email,
        row.r.partySize,
        row.p.venueName,
        row.p.city,
        row.p.state,
        row.p.zip,
        row.m.opponent,
        new Date(row.m.kickoffUtc).toISOString(),
        row.r.confirmationSentAt ? new Date(row.r.confirmationSentAt).toISOString() : '',
        row.r.reminderSentAt ? new Date(row.r.reminderSentAt).toISOString() : '',
      ]
        .map(csvEscape)
        .join(','),
    );
  }
  const body = lines.join('\n');
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rsvps-${Date.now()}.csv"`,
    },
  });
}
