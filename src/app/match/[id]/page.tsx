import Link from 'next/link';
import { notFound } from 'next/navigation';
import { matchById } from '@/lib/matches';
import { partiesForMatch, NEAR_RADIUS_MI, type PartyWithMatch, type PartyWithDistance } from '@/lib/parties';
import { lookupZip } from '@/lib/geo/zip';
import { haversineMiles } from '@/lib/geo/distance';
import { PartyCard } from '@/components/PartyCard';
import { Countdown } from '@/components/Countdown';
import { ZipSearch } from '@/components/ZipSearch';
import { PartiesMap, type MapOrigin, type MapParty } from '@/components/PartiesMap';
import { KickoffTime } from '@/components/KickoffTime';

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

export default async function MatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ zip?: string }>;
}) {
  const { id } = await params;
  const { zip } = await searchParams;
  const match = await matchById(id);
  if (!match) notFound();

  const parties = await partiesForMatch(match.id);

  // Server-render snapshot; the Countdown component itself handles live ticking.
  // eslint-disable-next-line react-hooks/purity
  const upcoming = match.kickoffUtc.getTime() > Date.now();

  let near: PartyWithDistance[] = [];
  let elsewhere: PartyWithDistance[] = [];
  let originLabel: string | null = null;
  let mapOrigin: MapOrigin | undefined;
  let zipNotFound = false;

  if (zip) {
    const origin = await lookupZip(zip);
    if (origin) {
      const withDist = parties
        .map((p) => ({ ...p, distanceMi: haversineMiles(origin, p) }))
        .sort((a, b) => a.distanceMi - b.distanceMi);
      near = withDist.filter((p) => p.distanceMi <= NEAR_RADIUS_MI);
      elsewhere = withDist.filter((p) => p.distanceMi > NEAR_RADIUS_MI);
      originLabel = origin.city && origin.state ? `${origin.city}, ${origin.state}` : zip;
      mapOrigin = { lat: origin.lat, lng: origin.lng, label: originLabel };
    } else {
      zipNotFound = true;
    }
  }

  const mapParties: MapParty[] = parties.map(toMapParty);

  return (
    <div>
      {/* HERO */}
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
            <KickoffTime iso={match.kickoffUtc.toISOString()} />
            {match.isTbd && ' · TBC'}
            {match.venueCity && ` · ${match.venueCity}${match.venueCountry ? `, ${match.venueCountry}` : ''}`}
          </p>
          {match.notes && (
            <p className="mt-2 text-sm text-aus-gold-200 max-w-2xl">{match.notes}</p>
          )}
          {upcoming && (
            <div className="mt-6 max-w-md">
              <Countdown targetIso={match.kickoffUtc.toISOString()} />
            </div>
          )}
        </div>
      </section>

      {/* ZIP SEARCH */}
      {parties.length > 0 && (
        <section className="border-b border-neutral-200 bg-aus-cream/40">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
            <p className="text-sm font-semibold text-aus-ink mb-2">
              Find a watch party near you for this match
            </p>
            <ZipSearch initial={zip} />
            {zipNotFound && (
              <p className="mt-2 text-sm text-neutral-600">
                We don&apos;t recognise that ZIP — try a 5-digit US ZIP.
              </p>
            )}
          </div>
        </section>
      )}

      {/* MAP */}
      {mapParties.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-8 sm:pt-10">
          <PartiesMap parties={mapParties} origin={mapOrigin} radiusMi={NEAR_RADIUS_MI} />
        </section>
      )}

      {/* CARDS */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        {parties.length === 0 ? (
          <p className="text-neutral-600">No watch parties for this match yet. Check back soon.</p>
        ) : originLabel ? (
          <>
            <div className="mb-2">
              <h2 className="font-display text-2xl sm:text-3xl uppercase">
                Watch parties near <span className="gold-underline">{originLabel}</span>
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                {near.length > 0
                  ? `${near.length} for this match within ${NEAR_RADIUS_MI} mi.`
                  : `Nothing for this match within ${NEAR_RADIUS_MI} mi yet — closest options are below.`}
              </p>
            </div>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {near.map((p) => (
                <PartyCard key={p.id} p={p} />
              ))}
            </div>

            {elsewhere.length > 0 && (
              <div className="mt-10">
                <h3 className="font-display text-xl sm:text-2xl uppercase">
                  More watch parties for this match across America
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
            <h2 className="font-display text-2xl sm:text-3xl uppercase">
              {parties.length} {parties.length === 1 ? 'watch party' : 'watch parties'} for this match
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Enter your ZIP above to sort by distance.
            </p>
            <div className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2">
              {parties.map((p) => (
                <PartyCard key={p.id} p={p} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
