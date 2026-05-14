import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { rsvps, parties, matches } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function AdminRsvpsPage({
  searchParams,
}: {
  searchParams: Promise<{ party?: string }>;
}) {
  await requireAdmin();
  const { party: partyFilter } = await searchParams;

  const query = db
    .select({
      rsvp: rsvps,
      party: parties,
      match: matches,
    })
    .from(rsvps)
    .innerJoin(parties, eq(rsvps.partyId, parties.id))
    .innerJoin(matches, eq(parties.matchId, matches.id))
    .orderBy(desc(rsvps.createdAt));

  const rows = partyFilter
    ? await query.where(eq(rsvps.partyId, partyFilter))
    : await query;

  const csvHref = `/api/admin/rsvps.csv${partyFilter ? `?party=${partyFilter}` : ''}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase">RSVPs</h1>
        <a
          href={csvHref}
          className="rounded-lg bg-aus-gold text-aus-ink font-display uppercase px-4 py-2 hover:bg-aus-gold-200"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-neutral-500 bg-neutral-50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Party</th>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Confirm</th>
              <th className="px-4 py-3">Reminder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {rows.map((r) => (
              <tr key={r.rsvp.id}>
                <td className="px-4 py-3 font-medium">{r.rsvp.name}</td>
                <td className="px-4 py-3">{r.rsvp.email}</td>
                <td className="px-4 py-3">{r.rsvp.partySize}</td>
                <td className="px-4 py-3">
                  <Link href={`/parties/${r.party.slug}`} className="text-aus-green hover:underline">
                    {r.party.venueName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600">AUS vs {r.match.opponent}</td>
                <td className="px-4 py-3 text-neutral-500 text-xs">
                  {new Date(r.rsvp.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs">
                  {r.rsvp.confirmationSentAt ? '✓' : '—'}
                </td>
                <td className="px-4 py-3 text-xs">
                  {r.rsvp.reminderSentAt ? '✓' : '—'}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                  No RSVPs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
