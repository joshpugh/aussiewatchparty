import Link from 'next/link';
import { Countdown } from '@/components/Countdown';
import { ZipSearch } from '@/components/ZipSearch';
import { PartyCard } from '@/components/PartyCard';
import { listMatches, nextMatch } from '@/lib/matches';
import { lookupZip } from '@/lib/geo/zip';
import { listPublishedParties, partiesNear, type PartyWithMatch, type PartyWithDistance } from '@/lib/parties';

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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ zip?: string }>;
}) {
  const { zip } = await searchParams;
  const next = await nextMatch();
  const matches = await listMatches();

  let parties: PartyWithMatch[] | PartyWithDistance[] = [];
  let originLabel: string | null = null;
  let zipNotFound = false;

  if (zip) {
    const origin = await lookupZip(zip);
    if (origin) {
      parties = await partiesNear(origin);
      originLabel = origin.city && origin.state ? `${origin.city}, ${origin.state}` : zip;
    } else {
      zipNotFound = true;
      parties = await listPublishedParties();
    }
  } else {
    parties = await listPublishedParties();
  }

  return (
    <div>
      {/* HERO */}
      <section className="aus-stripes text-aus-gold">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
          <p className="font-display uppercase tracking-widest text-sm text-aus-gold-200">
            Watch parties · United States
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-6xl leading-[0.95] uppercase">
            Find your <span className="text-white">Socceroos</span><br />
            home ground.
          </h1>
          <p className="mt-5 max-w-xl text-aus-gold-200 text-base sm:text-lg leading-relaxed">
            Pubs, clubs and venues across the country tuning in for the matches.
            Punch in your ZIP — we&apos;ll show you the closest mob.
          </p>

          <div className="mt-7">
            <ZipSearch initial={zip} />
            {zipNotFound && (
              <p className="mt-2 text-sm text-aus-gold-200">
                We don&apos;t recognise that ZIP yet — showing all parties below.
              </p>
            )}
          </div>

          {next && (
            <div className="mt-10 rounded-2xl bg-aus-green-900/60 backdrop-blur p-5 sm:p-6 border border-aus-gold/20 max-w-2xl">
              <p className="text-xs uppercase tracking-widest text-aus-gold-200">
                Next match
              </p>
              <p className="mt-1 font-display text-xl sm:text-2xl text-white">
                AUS vs {next.opponent}
              </p>
              <p className="mt-1 text-sm text-aus-gold-200">
                {formatKickoff(next.kickoffUtc)}
                {next.isTbd && ' · time TBC'}
              </p>
              <div className="mt-5">
                <Countdown targetIso={next.kickoffUtc.toISOString()} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PARTIES */}
      <section id="parties" className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl uppercase">
              {originLabel ? <>Parties near <span className="gold-underline">{originLabel}</span></> : 'All parties'}
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              {parties.length === 0
                ? 'No parties listed yet — check back soon.'
                : `${parties.length} ${parties.length === 1 ? 'venue' : 'venues'} signed up so far.`}
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {parties.map((p) => (
            <PartyCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* MATCHES */}
      <section id="matches" className="bg-white border-t border-neutral-200">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <h2 className="font-display text-2xl sm:text-3xl uppercase">The fixtures</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Times shown in your local timezone. Some matches are still TBC.
          </p>
          <ul className="mt-6 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-aus-paper">
            {matches.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/match/${m.id}`}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-aus-cream transition"
                >
                  <div>
                    <p className="font-display text-base sm:text-lg uppercase">
                      AUS vs {m.opponent}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-600">
                      {formatKickoff(m.kickoffUtc)}
                      {m.venueCity && ` · ${m.venueCity}`}
                      {m.isTbd && ' · TBC'}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-aus-green hidden sm:inline">
                    See parties →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
