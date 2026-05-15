import Link from 'next/link';
import { Countdown } from '@/components/Countdown';
import { ZipSearch } from '@/components/ZipSearch';
import { PartyCard } from '@/components/PartyCard';
import { PartiesMap, type MapParty, type MapOrigin } from '@/components/PartiesMap';
import { listMatches, nextMatch } from '@/lib/matches';
import { lookupZip } from '@/lib/geo/zip';
import {
  listPublishedParties,
  partiesNearGrouped,
  NEAR_RADIUS_MI,
  type PartyWithMatch,
  type PartyWithDistance,
} from '@/lib/parties';

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

function toMapParty(p: PartyWithMatch | PartyWithDistance): MapParty {
  return {
    slug: p.slug,
    venueName: p.venueName,
    city: p.city,
    state: p.state,
    lat: p.lat,
    lng: p.lng,
    matchOpponent: p.match.opponent,
  };
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

  // Map always shows every watch party, so visitors get a national picture.
  const allParties: PartyWithMatch[] = await listPublishedParties();

  let near: PartyWithDistance[] = [];
  let elsewhere: PartyWithDistance[] = [];
  let originLabel: string | null = null;
  let mapOrigin: MapOrigin | undefined;
  let zipNotFound = false;

  if (zip) {
    const origin = await lookupZip(zip);
    if (origin) {
      const grouped = await partiesNearGrouped(origin, NEAR_RADIUS_MI);
      near = grouped.near;
      elsewhere = grouped.elsewhere;
      originLabel = origin.city && origin.state ? `${origin.city}, ${origin.state}` : zip;
      mapOrigin = { lat: origin.lat, lng: origin.lng, label: originLabel };
    } else {
      zipNotFound = true;
    }
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
            Pubs, clubs and venues across America tuning in for the matches.
            Enter your ZIP code — we&apos;ll show you the closest watch party.
          </p>

          <div className="mt-7">
            <ZipSearch initial={zip} />
            {zipNotFound && (
              <p className="mt-2 text-sm text-aus-gold-200">
                We don&apos;t recognise that ZIP yet — try a 5-digit US ZIP, or browse all watch parties below.
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

      {/* MAP — every watch party is rendered, but when a ZIP is provided we
          zoom to that area and draw the search radius. */}
      {allParties.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-10 sm:pt-14">
          <PartiesMap
            parties={allParties.map(toMapParty)}
            origin={mapOrigin}
            radiusMi={NEAR_RADIUS_MI}
          />
        </section>
      )}

      {/* PARTIES */}
      <section id="parties" className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        {originLabel ? (
          <>
            {/* NEAR YOU */}
            <div className="mb-2">
              <h2 className="font-display text-2xl sm:text-3xl uppercase">
                Watch parties near <span className="gold-underline">{originLabel}</span>
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                {near.length > 0
                  ? `${near.length} within ${NEAR_RADIUS_MI} mi.`
                  : `Nothing within ${NEAR_RADIUS_MI} mi yet — the closest ones across America are below.`}
              </p>
            </div>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {near.map((p) => (
                <PartyCard key={p.id} p={p} />
              ))}
            </div>

            {/* ELSEWHERE */}
            {elsewhere.length > 0 && (
              <div className="mt-10">
                <h3 className="font-display text-xl sm:text-2xl uppercase">
                  More watch parties across America
                </h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Sorted by distance from {originLabel}.
                </p>
                <div className="mt-4 grid gap-3 sm:gap-4 sm:grid-cols-2">
                  {elsewhere.map((p) => (
                    <PartyCard key={p.id} p={p} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="font-display text-2xl sm:text-3xl uppercase">All watch parties</h2>
              <p className="text-sm text-neutral-600 mt-1">
                {allParties.length === 0
                  ? 'No watch parties listed yet — check back soon.'
                  : `${allParties.length} ${allParties.length === 1 ? 'venue' : 'venues'} signed up so far. Enter your ZIP above to sort by distance.`}
              </p>
            </div>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {allParties.map((p) => (
                <PartyCard key={p.id} p={p} />
              ))}
            </div>
          </>
        )}
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
                    See watch parties →
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
