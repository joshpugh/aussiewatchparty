import { notFound } from 'next/navigation';
import Link from 'next/link';
import { partyBySlug } from '@/lib/parties';
import { RsvpForm } from '@/components/RsvpForm';

import { KickoffTime } from '@/components/KickoffTime';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await partyBySlug(slug);
  if (!p) return {};
  return {
    title: `${p.venueName} — AUS vs ${p.match.opponent}`,
    description: `Watch the Socceroos take on ${p.match.opponent} at ${p.venueName} in ${p.city}, ${p.state}.`,
  };
}

export default async function PartyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await partyBySlug(slug);
  if (!p) notFound();

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${p.venueName}, ${p.addressLine}, ${p.city}, ${p.state} ${p.zip}`,
  )}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <p className="text-sm">
        <Link href="/" className="text-aus-green hover:underline">
          ← All watch parties
        </Link>
      </p>

      <div className="mt-4 flex items-start gap-4">
        {p.venueLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.venueLogoUrl}
            alt={`${p.venueName} logo`}
            className="h-20 w-20 rounded-xl object-cover bg-neutral-100 flex-shrink-0"
          />
        ) : (
          <div className="h-20 w-20 rounded-xl bg-aus-green text-aus-gold font-display flex items-center justify-center text-3xl flex-shrink-0">
            {p.venueName.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl uppercase leading-tight">
            {p.venueName}
          </h1>
          <p className="mt-1 text-neutral-700">
            {p.addressLine}, {p.city}, {p.state} {p.zip}
          </p>
          <p className="mt-1 text-sm">
            <a className="text-aus-green hover:underline" target="_blank" rel="noreferrer" href={mapsHref}>
              Open in Maps →
            </a>
            {p.websiteUrl && (
              <>
                {' '}·{' '}
                <a className="text-aus-green hover:underline" target="_blank" rel="noreferrer" href={p.websiteUrl}>
                  Venue website
                </a>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-aus-green text-aus-gold p-5 sm:p-6">
        <p className="text-xs uppercase tracking-widest text-aus-gold-200">The match</p>
        <p className="mt-1 font-display text-2xl sm:text-3xl uppercase text-white">
          AUS vs {p.match.opponent}
        </p>
        <p className="mt-1 text-aus-gold-200">
          <KickoffTime iso={p.match.kickoffUtc.toISOString()} />
          {p.match.isTbd && ' · time TBC'}
          {p.match.venueCity && ` · ${p.match.venueCity}`}
        </p>
      </div>

      {p.hostNotes && (
        <div className="mt-6 rounded-xl border-l-4 border-aus-gold bg-aus-cream p-4 text-sm leading-relaxed">
          {p.hostNotes}
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl uppercase">RSVP</h2>
        <p className="text-sm text-neutral-600 mt-1">
          Help the venue plan. You&apos;ll get a confirmation and a reminder ~24h before kickoff.
        </p>
        <div className="mt-4">
          <RsvpForm partyId={p.id} />
        </div>
      </section>
    </div>
  );
}
