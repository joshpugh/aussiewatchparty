import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parties, type PartyStatus } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<PartyStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  published: 'bg-green-100 text-aus-green',
  rejected: 'bg-neutral-100 text-neutral-500',
};

const STATUS_LABELS: Record<PartyStatus, string> = {
  pending: 'Pending',
  published: 'Live',
  rejected: 'Rejected',
};

export default async function AdminPartiesList({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const filter = status as PartyStatus | undefined;

  const query = db.select().from(parties).orderBy(desc(parties.updatedAt));
  const rows = filter ? await query.where(eq(parties.status, filter)) : await query;

  const pendingCount = (await db.select().from(parties).where(eq(parties.status, 'pending'))).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase">Watch parties</h1>
        <Link
          href="/admin/parties/new"
          className="rounded-lg bg-aus-green text-aus-gold font-display uppercase px-4 py-2 hover:bg-aus-green-700"
        >
          + New watch party
        </Link>
      </div>

      {/* Status filter chips */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        {[
          { key: '', label: 'All' },
          { key: 'pending', label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          { key: 'published', label: 'Live' },
          { key: 'rejected', label: 'Rejected' },
        ].map((f) => {
          const active = (filter ?? '') === f.key;
          return (
            <Link
              key={f.key}
              href={f.key ? `/admin/parties?status=${f.key}` : '/admin/parties'}
              className={[
                'rounded-full px-3 py-1 border transition',
                active
                  ? 'bg-aus-green text-aus-gold border-aus-green'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:border-aus-green/50',
              ].join(' ')}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-neutral-500 bg-neutral-50">
            <tr>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3">Host</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {rows.map((p) => {
              const s = (p.status as PartyStatus) ?? 'published';
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.venueName}</td>
                  <td className="px-4 py-3">{p.city}, {p.state}</td>
                  <td className="px-4 py-3 text-neutral-600">{p.matchId}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {p.hostName ?? <span className="text-neutral-400">—</span>}
                    {p.submittedBy === 'public' && (
                      <span className="ml-2 inline-block rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                        Submitted
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[s]}`}>
                      {STATUS_LABELS[s]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/parties/${p.id}`} className="text-aus-green hover:underline">
                      {s === 'pending' ? 'Review' : 'Edit'}
                    </Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  {filter ? `No ${filter} watch parties.` : 'No watch parties yet. Add the first one above.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
