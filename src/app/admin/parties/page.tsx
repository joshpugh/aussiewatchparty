import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parties } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function AdminPartiesList() {
  await requireAdmin();
  const rows = await db.select().from(parties).orderBy(desc(parties.updatedAt));
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

      <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-neutral-500 bg-neutral-50">
            <tr>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium">{p.venueName}</td>
                <td className="px-4 py-3">{p.city}, {p.state}</td>
                <td className="px-4 py-3 text-neutral-600">{p.matchId}</td>
                <td className="px-4 py-3">
                  {p.isPublished ? (
                    <span className="text-xs font-semibold text-aus-green">Live</span>
                  ) : (
                    <span className="text-xs font-semibold text-neutral-500">Hidden</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/parties/${p.id}`} className="text-aus-green hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  No watch parties yet. Add the first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
