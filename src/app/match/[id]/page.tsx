import Link from 'next/link';
import { notFound } from 'next/navigation';
import { matchById } from '@/lib/matches';
import { partiesForMatch } from '@/lib/parties';
import { PartyCard } from '@/components/PartyCard';
import { Countdown } from '@/components/Countdown';

function formatKickoff(d: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(d);
}

export const dynamic = 'force-dynamic';

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await matchById(id);
  if (!match) notFound();
  const parties = await partiesForMatch(match.id);
  // Server-render snapshot; the Countdown component itself handles live ticking.
  // eslint-disable-next-line react-hooks/purity
  const upcoming = match.kickoffUtc.getTime() > Date.now();

  return (
    <div>
      <section className="aus-stripes text-aus-gold">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <p className="text-sm">
            <Link href="/" className="text-aus-gold-200 hover:underline">
              ← Home
            </Link>
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-6xl uppercase text-white leading-[0.95]">
            AUS vs {match.opponent}
          </h1>
          <p className="mt-3 text-aus-gold-200">
            {formatKickoff(match.kickoffUtc)}
            {match.isTbd && ' · TBC'}
            {match.venueCity && ` · ${match.venueCity}, ${match.venueCountry ?? ''}`}
          </p>
          {upcoming && (
            <div className="mt-6 max-w-md">
              <Countdown targetIso={match.kickoffUtc.toISOString()} />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <h2 className="font-display text-2xl sm:text-3xl uppercase">
          {parties.length} {parties.length === 1 ? 'watch party' : 'watch parties'} for this one
        </h2>
        {match.notes && <p className="mt-2 text-neutral-700">{match.notes}</p>}
        <div className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2">
          {parties.map((p) => (
            <PartyCard key={p.id} p={p} />
          ))}
          {parties.length === 0 && (
            <p className="text-neutral-600">No watch parties for this match yet. Check back soon.</p>
          )}
        </div>
      </section>
    </div>
  );
}
