/**
 * Partner strip rendered between the hero and the watch-party board.
 *
 * - Max 4 entries (will visually crowd beyond that on mobile).
 * - First entry is the primary sponsor (America Josh).
 * - `logoUrl` is optional; entries without a logo render as a styled text
 *   tile so the strip still looks complete while you wait for artwork.
 * - Add a partner: drop a logo into Vercel Blob (or any CDN), copy the URL,
 *   append a new object below. No deploy needed beyond pushing this file.
 */
export type Partner = {
  name: string;
  url: string;
  /** Public image URL — square or wide rectangle, transparent or white bg. */
  logoUrl?: string;
  /** Optional shorter label shown on very narrow screens. */
  shortName?: string;
};

export const PARTNERS: Partner[] = [
  {
    name: 'America Josh',
    shortName: 'America Josh',
    url: 'https://americajosh.com',
    // Drop the real logo URL here. Leave undefined to render as a text tile.
    // logoUrl: 'https://...',
  },
  // Add up to 3 more partners:
  // { name: 'Partner Two', url: 'https://example.com', logoUrl: 'https://...' },
  // { name: 'Partner Three', url: 'https://example.com', logoUrl: 'https://...' },
  // { name: 'Partner Four', url: 'https://example.com', logoUrl: 'https://...' },
];
