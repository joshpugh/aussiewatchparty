import Link from 'next/link';
import { listMatches } from '@/lib/matches';
import { SubmitForm } from '@/components/SubmitForm';

export const metadata = {
  title: 'Submit your watch party',
  description:
    'List your venue as an official Socceroos watch party for the 2026 tournament. Free, takes about 2 minutes.',
};

export const dynamic = 'force-dynamic';

export default async function SubmitPage() {
  const matches = await listMatches();

  return (
    <div>
      <section className="aus-stripes text-aus-gold">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <p className="text-sm">
            <Link href="/" className="text-aus-gold-200 hover:underline">
              ← Home
            </Link>
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl uppercase text-white leading-[0.95]">
            Host a Socceroos watch party.
          </h1>
          <p className="mt-4 max-w-xl text-aus-gold-200 leading-relaxed">
            List your pub, club or venue and we&apos;ll put it on the map for fans across America.
            Free. Takes about two minutes. We email you whenever someone RSVPs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-8 shadow-sm">
          <SubmitForm matches={matches} />
        </div>
        <p className="mt-4 text-xs text-neutral-500 leading-relaxed">
          Submissions are reviewed by a human within 24 hours. We&apos;ll email you when your
          listing goes live (or if we need to clarify anything). You can cancel any time by
          replying to that email.
        </p>
      </section>
    </div>
  );
}
