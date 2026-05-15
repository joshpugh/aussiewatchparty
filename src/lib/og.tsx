/**
 * Shared helpers for dynamic Open Graph images built with `next/og`.
 *
 * Satori (the renderer behind ImageResponse) has a constrained CSS subset:
 *   - every container element needs `display: flex` (or 'block' for single text)
 *   - text-only children must be the sole child of a flex container
 *   - no arbitrary CSS classes; everything goes through inline `style`
 *
 * So we resist the urge to share JSX wrappers and instead share constants
 * + format helpers. Each `opengraph-image.tsx` composes its own layout.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

export const COLORS = {
  green: '#00843D',
  greenDark: '#006B30',
  greenDarker: '#003F1C',
  gold: '#FFCD00',
  goldLight: '#FFE680',
  cream: '#FFF8DC',
  white: '#FFFFFF',
  ink: '#0A0A0A',
} as const;

/**
 * Diagonal Aussie-stripes background as a CSS gradient string.
 * Used as the `backgroundImage` on the OG image root.
 */
export const STRIPES_BG = `repeating-linear-gradient(135deg, ${COLORS.green} 0, ${COLORS.green} 60px, ${COLORS.greenDark} 60px, ${COLORS.greenDark} 120px)`;

/**
 * Format a match kickoff in Eastern Time — OG images are shared globally
 * but we don't know the viewer's timezone at render time. ET is the most
 * commonly-relevant US timezone for our audience.
 */
export function formatKickoffET(d: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: 'America/New_York',
  }).format(d);
}
