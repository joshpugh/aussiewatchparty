import type { Metadata } from 'next';
import { Archivo_Black, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { PoweredBy } from '@/components/PoweredBy';

const display = Archivo_Black({
  variable: '--font-display',
  weight: '400',
  subsets: ['latin'],
});

const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Aussie Watch Party USA',
    template: '%s — Aussie Watch Party USA',
  },
  description:
    "Find a Socceroos watch party near you. Pubs, clubs and venues across the US tuning in for the matches.",
  openGraph: {
    title: 'Aussie Watch Party USA',
    description: 'Find a Socceroos watch party near you.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <PoweredBy variant="footer" />
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
