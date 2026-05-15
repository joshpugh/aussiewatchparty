import { ImageResponse } from 'next/og';
import { COLORS, OG_CONTENT_TYPE, OG_SIZE, STRIPES_BG } from '@/lib/og';
import { getOgFonts } from '@/lib/og-fonts';

export const runtime = 'nodejs';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Aussie Watch Party USA — find a Socceroos watch party near you.';

export default async function HomeOgImage() {
  const fonts = await getOgFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px 80px',
          backgroundImage: STRIPES_BG,
          color: COLORS.gold,
          fontFamily: 'Archivo',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontWeight: 700,
            color: COLORS.goldLight,
            fontFamily: 'Archivo',
          }}
        >
          Aussie Watch Party · USA
        </div>

        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 124,
                color: COLORS.white,
                lineHeight: 1.0,
                textTransform: 'uppercase',
                fontFamily: 'Archivo Black',
              }}
            >
              Find your
            </div>
            <div
              style={{
                fontSize: 124,
                color: COLORS.gold,
                lineHeight: 1.0,
                textTransform: 'uppercase',
                fontFamily: 'Archivo Black',
              }}
            >
              Socceroos
            </div>
            <div
              style={{
                fontSize: 124,
                color: COLORS.white,
                lineHeight: 1.0,
                textTransform: 'uppercase',
                fontFamily: 'Archivo Black',
              }}
            >
              home ground.
            </div>
            <div
              style={{
                marginTop: 32,
                fontSize: 32,
                fontWeight: 400,
                color: COLORS.goldLight,
                maxWidth: 900,
                fontFamily: 'Archivo',
              }}
            >
              Watch parties across America for the 2026 tournament.
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.gold,
            fontFamily: 'Archivo',
          }}
        >
          <div style={{ display: 'flex' }}>aussiewatchparty.com</div>
          <div style={{ display: 'flex', letterSpacing: 2 }}>GO SOCCEROOS 🦘</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
