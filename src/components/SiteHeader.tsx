import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-aus-green text-aus-gold">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-display tracking-wide text-base sm:text-xl uppercase leading-none flex-shrink-0"
        >
          Aussie<span className="text-white"> </span>Watch<span className="text-white"> </span>Party
          <span className="text-white"> </span>USA
        </Link>
        <nav className="text-sm font-semibold flex items-center gap-2 sm:gap-4">
          <Link
            href="/#matches"
            className="hover:underline hidden md:inline"
          >
            Matches
          </Link>
          <Link
            href="/submit"
            className="hidden sm:inline hover:underline text-aus-gold-200 hover:text-aus-gold whitespace-nowrap"
          >
            List your venue
          </Link>
          <Link
            href="/#parties"
            className="rounded-full bg-aus-gold text-aus-ink px-3 py-1.5 hover:bg-aus-gold-200 transition whitespace-nowrap"
          >
            <span className="hidden sm:inline">Find a watch party</span>
            <span className="sm:hidden">Find a party</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
