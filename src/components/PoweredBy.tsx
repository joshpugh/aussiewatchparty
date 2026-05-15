import { PARTNERS, type Partner } from '@/config/partners';

function PartnerTile({ partner }: { partner: Partner }) {
  const label = partner.shortName ?? partner.name;
  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={partner.name}
      className="group inline-flex items-center justify-center transition hover:opacity-80"
    >
      {partner.logoUrl ? (
        // Plain <img> so we don't need to register every partner domain with
        // next/image. Logos are small + cacheable so the optimisation isn't
        // worth the config friction here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={partner.logoUrl}
          alt={partner.name}
          className="h-8 sm:h-10 w-auto max-w-[180px] sm:max-w-[220px] object-contain"
        />
      ) : (
        <span className="font-display uppercase tracking-wide text-sm sm:text-base text-aus-ink group-hover:text-aus-green transition">
          {label}
        </span>
      )}
    </a>
  );
}

/**
 * "Powered by" sponsor strip. Two presentations:
 *
 * - `variant="page"` (default): inline section on the homepage between
 *   the hero and the watch-party board. Bottom border transitions into
 *   the next section.
 * - `variant="footer"`: rendered once in the root layout just above the
 *   site footer on every page. Top border separates it from page content.
 *
 * Logos render directly on the white section background — no individual
 * tile chrome — so the partner marks read as one continuous strip.
 */
export function PoweredBy({ variant = 'page' }: { variant?: 'page' | 'footer' }) {
  if (PARTNERS.length === 0) return null;

  const wrapperClass =
    variant === 'footer'
      ? 'border-t border-neutral-200 bg-white'
      : 'border-b border-neutral-200 bg-white';

  return (
    <section className={wrapperClass}>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
        <p className="text-xs font-display uppercase tracking-widest text-neutral-500 flex-shrink-0">
          Powered by
        </p>
        <div className="flex flex-wrap items-center gap-x-8 sm:gap-x-12 gap-y-4">
          {PARTNERS.slice(0, 4).map((p) => (
            <PartnerTile key={p.url} partner={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
