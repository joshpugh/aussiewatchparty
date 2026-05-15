import { ImageResponse } from 'next/og';
import { COLORS } from '@/lib/og';
import { getOgFonts } from '@/lib/og-fonts';

export const runtime = 'nodejs';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * 32×32 favicon — gold "A" on a green background, set in Archivo Black to
 * match the wordmark in the header and the OG cards.
 */
export default async function Icon() {
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
          fontSize: 28,
          lineHeight: 1,
        }}
      >
        A
      </div>
    ),
    { ...size, fonts },
  );
}
