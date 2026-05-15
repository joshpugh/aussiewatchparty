import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-neutral-600 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <p className="leading-relaxed">
          Unofficial. Made by fans, for fans. Not affiliated with FIFA, Football Australia, or
          any governing body.{' '}
          <Link href="/submit" className="text-aus-green hover:underline font-semibold">
            Host a watch party →
          </Link>
        </p>
        <p>
          <span className="font-display text-aus-green">GO SOCCEROOS</span> 🦘
        </p>
      </div>
    </footer>
  );
}
