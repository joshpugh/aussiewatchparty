import { PARTNERS, type Partner } from '@/config/partners';

function PartnerTile({ partner }: { partner: Partner }) {
  const label = partner.shortName ?? partner.name;
  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={partner.name}
      className="group flex items-center justify-center h-12 sm:h-14 min-w-[120px] sm:min-w-[160px] rounded-lg bg-white border border-neutral-200 hover:border-aus-green/40 hover:shadow-sm transition px-4"
    >
      {partner.logoUrl ? (
        // Plain <img> so we don't need to register every partner domain with
        // next/image. Logos are small + cacheable so the optimisation isn't
        // worth the config friction here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={partner.logoUrl}
          alt={partner.name}
          className="max-h-8 sm:max-h-10 w-auto object-contain"
        />
      ) : (
        <span className="font-display uppercase tracking-wide text-xs sm:text-sm text-aus-ink group-hover:text-aus-green transition">
          {label}
        </span>
      )}
    </a>
  );
}

export function PoweredBy() {
  if (PARTNERS.length === 0) return null;

  return (
    <section className="border-b border-neutral-200 bg-aus-cream/40">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <p className="text-xs font-display uppercase tracking-widest text-neutral-500 flex-shrink-0">
          Powered by
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {PARTNERS.slice(0, 4).map((p) => (
            <PartnerTile key={p.url} partner={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
