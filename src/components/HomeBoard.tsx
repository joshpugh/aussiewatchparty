'use client';
import { useMemo, useState } from 'react';
import { PartiesMap, type MapParty, type MapOrigin } from './PartiesMap';
import { PartyCard } from './PartyCard';
import type { Match } from '@/lib/db/schema';
import type { PartyWithMatch, PartyWithDistance } from '@/lib/parties';

type Props = {
  allParties: PartyWithMatch[];
  near: PartyWithDistance[];
  elsewhere: PartyWithDistance[];
  matches: Match[];
  originLabel: string | null;
  mapOrigin?: MapOrigin;
  radiusMi: number;
};

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

function FilterChip({
  selected,
  onClick,
  children,
  count,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition border',
        selected
          ? 'bg-aus-green text-aus-gold border-aus-green'
          : 'bg-white text-aus-ink border-neutral-300 hover:border-aus-green/60 hover:bg-aus-cream',
      ].join(' ')}
    >
      {children}
      {typeof count === 'number' && (
        <span
          className={[
            'inline-flex items-center justify-center rounded-full px-2 text-[10px] font-bold leading-5 min-w-[20px]',
            selected ? 'bg-aus-gold text-aus-green' : 'bg-neutral-100 text-neutral-600',
          ].join(' ')}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function HomeBoard({
  allParties,
  near,
  elsewhere,
  matches,
  originLabel,
  mapOrigin,
  radiusMi,
}: Props) {
  const [matchId, setMatchId] = useState<string | null>(null);

  // Pre-compute per-match counts off the unfiltered list so chip labels stay
  // honest as you toggle.
  const countsByMatch = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of allParties) m.set(p.matchId, (m.get(p.matchId) ?? 0) + 1);
    return m;
  }, [allParties]);

  const filtered = useMemo(() => {
    const f = (p: { matchId: string }) => matchId === null || p.matchId === matchId;
    return {
      all: allParties.filter(f),
      near: near.filter(f),
      elsewhere: elsewhere.filter(f),
    };
  }, [allParties, near, elsewhere, matchId]);

  const mapParties: MapParty[] = useMemo(
    () => filtered.all.map(toMapParty),
    [filtered.all],
  );

  if (allParties.length === 0) {
    return (
      <p className="text-neutral-600">
        No watch parties listed yet — check back soon.
      </p>
    );
  }

  return (
    <>
      {/* FILTER CHIPS */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip
          selected={matchId === null}
          onClick={() => setMatchId(null)}
          count={allParties.length}
        >
          All matches
        </FilterChip>
        {matches.map((m) => (
          <FilterChip
            key={m.id}
            selected={matchId === m.id}
            onClick={() => setMatchId(m.id)}
            count={countsByMatch.get(m.id) ?? 0}
          >
            vs {m.opponent}
          </FilterChip>
        ))}
      </div>

      {/* MAP */}
      <div className="mb-8">
        <PartiesMap parties={mapParties} origin={mapOrigin} radiusMi={radiusMi} />
      </div>

      {/* CARDS */}
      {originLabel ? (
        <>
          <div className="mb-2">
            <h2 className="font-display text-2xl sm:text-3xl uppercase">
              Watch parties near <span className="gold-underline">{originLabel}</span>
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              {filtered.near.length > 0
                ? `${filtered.near.length} within ${radiusMi} mi.`
                : `Nothing within ${radiusMi} mi yet — the closest ones across America are below.`}
            </p>
          </div>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            {filtered.near.map((p) => (
              <PartyCard key={p.id} p={p} />
            ))}
          </div>

          {filtered.elsewhere.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display text-xl sm:text-2xl uppercase">
                More watch parties across America
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                Sorted by distance from {originLabel}.
              </p>
              <div className="mt-4 grid gap-3 sm:gap-4 sm:grid-cols-2">
                {filtered.elsewhere.map((p) => (
                  <PartyCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          )}

          {filtered.near.length === 0 && filtered.elsewhere.length === 0 && (
            <p className="text-neutral-600 mt-4">No watch parties for this match yet.</p>
          )}
        </>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="font-display text-2xl sm:text-3xl uppercase">All watch parties</h2>
            <p className="text-sm text-neutral-600 mt-1">
              {filtered.all.length} {filtered.all.length === 1 ? 'venue' : 'venues'}
              {matchId
                ? matches.find((m) => m.id === matchId)
                  ? ` for AUS vs ${matches.find((m) => m.id === matchId)!.opponent}.`
                  : '.'
                : ' signed up so far.'}{' '}
              Enter your ZIP above to sort by distance.
            </p>
          </div>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            {filtered.all.map((p) => (
              <PartyCard key={p.id} p={p} />
            ))}
          </div>
          {filtered.all.length === 0 && (
            <p className="text-neutral-600 mt-4">No watch parties for this match yet.</p>
          )}
        </>
      )}
    </>
  );
}
