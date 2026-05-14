import Link from 'next/link';
import type { PartyWithDistance, PartyWithMatch } from '@/lib/parties';

function formatKickoff(d: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(d);
}

export function PartyCard({ p }: { p: PartyWithMatch | PartyWithDistance }) {
  const distance = 'distanceMi' in p ? p.distanceMi : null;
  return (
    <Link
      href={`/parties/${p.slug}`}
      className="group block rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-aus-green/40 transition"
    >
      <div className="flex items-start gap-4">
        {p.venueLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.venueLogoUrl}
            alt={`${p.venueName} logo`}
            className="h-14 w-14 rounded-lg object-cover bg-neutral-100 flex-shrink-0"
          />
        ) : (
          <div className="h-14 w-14 rounded-lg bg-aus-green text-aus-gold font-display flex items-center justify-center text-xl flex-shrink-0">
            {p.venueName.slice(0, 1)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display text-lg leading-tight text-aus-ink truncate">
              {p.venueName}
            </h3>
            {distance !== null && (
              <span className="text-xs font-semibold text-aus-green flex-shrink-0">
                {distance.toFixed(1)} mi
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-600 truncate">
            {p.city}, {p.state} {p.zip}
          </p>
          <p className="mt-2 text-sm">
            <span className="text-neutral-500">vs </span>
            <span className="font-semibold text-aus-ink">{p.match.opponent}</span>
            <span className="text-neutral-500"> · {formatKickoff(p.match.kickoffUtc)}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
