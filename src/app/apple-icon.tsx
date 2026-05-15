import { ImageResponse } from 'next/og';
import { COLORS } from '@/lib/og';
import { getOgFonts } from '@/lib/og-fonts';

export const runtime = 'nodejs';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * 180×180 Apple Touch Icon — same mark as `icon.tsx`, sized for iOS home
 * screens. iOS auto-rounds the corners, so we render a full bleed square.
 */
export default async function AppleIcon() {
  const fonts = await getOgFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: COLORS.green,
          color: COLORS.gold,
          fontFamily: 'Archivo Black',
          fontSize: 140,
          lineHeight: 1,
        }}
      >
        A
      </div>
    ),
    { ...size, fonts },
  );
}
