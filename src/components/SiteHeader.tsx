import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-aus-green text-aus-gold">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="font-display tracking-wide text-lg sm:text-xl uppercase leading-none"
        >
          Aussie<span className="text-white"> </span>Watch<span className="text-white"> </span>Party
        </Link>
        <nav className="text-sm font-semibold flex items-center gap-4">
          <Link href="/#parties" className="hover:underline">
            Find a watch party
          </Link>
          <Link href="/#matches" className="hover:underline hidden sm:inline">
            Matches
          </Link>
        </nav>
      </div>
    </header>
  );
}
