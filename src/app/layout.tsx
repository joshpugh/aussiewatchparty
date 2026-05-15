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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Aussie Watch Party USA',
    template: '%s — Aussie Watch Party USA',
  },
  description:
    "Find a Socceroos watch party near you. Pubs, clubs and venues across America tuning in for the 2026 men's tournament.",
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Aussie Watch Party USA',
    description:
      "Find a Socceroos watch party near you. Pubs, clubs and venues across America tuning in for the 2026 men's tournament.",
    type: 'website',
    url: SITE_URL,
    siteName: 'Aussie Watch Party USA',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aussie Watch Party USA',
    description: 'Find a Socceroos watch party near you. Pubs, clubs and venues across America.',
  },
  applicationName: 'Aussie Watch Party USA',
  authors: [{ name: 'America Josh', url: 'https://americajosh.com' }],
  keywords: [
    'Socceroos',
    'Australia',
    'World Cup 2026',
    'watch party',
    'Aussie pub USA',
    'Group D',
    'soccer',
    'football',
  ],
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
