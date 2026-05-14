import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parties } from '@/lib/db/schema';
import { listMatches } from '@/lib/matches';
import { PartyForm } from '../PartyForm';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function EditPartyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const matches = await listMatches();
  const rows = await db.select().from(parties).where(eq(parties.id, id)).limit(1);
  if (rows.length === 0) notFound();
  const party = rows[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm">
        <Link href="/admin/parties" className="text-aus-green hover:underline">
          ← All parties
        </Link>
      </p>
      <h1 className="mt-2 font-display text-2xl uppercase">Edit: {party.venueName}</h1>
      <div className="mt-6">
        <PartyForm matches={matches} party={party} />
      </div>
    </div>
  );
}
