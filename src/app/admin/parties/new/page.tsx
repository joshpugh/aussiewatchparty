import Link from 'next/link';
import { listMatches } from '@/lib/matches';
import { PartyForm } from '../PartyForm';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function NewPartyPage() {
  await requireAdmin();
  const matches = await listMatches();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm">
        <Link href="/admin/parties" className="text-aus-green hover:underline">
          ← All watch parties
        </Link>
      </p>
      <h1 className="mt-2 font-display text-2xl uppercase">New watch party</h1>
      <div className="mt-6">
        <PartyForm matches={matches} />
      </div>
    </div>
  );
}
