import { ImageResponse } from 'next/og';
import { COLORS, OG_CONTENT_TYPE, OG_SIZE, STRIPES_BG } from '@/lib/og';

export const runtime = 'nodejs';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Aussie Watch Party USA — find a Socceroos watch party near you.';

export default async function HomeOgImage() {
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
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontWeight: 800,
            color: COLORS.goldLight,
          }}
        >
          Aussie Watch Party · USA
        </div>

        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 116,
                fontWeight: 900,
                color: COLORS.white,
                lineHeight: 1.02,
                textTransform: 'uppercase',
                letterSpacing: -2,
              }}
            >
              Find your
            </div>
            <div
              style={{
                fontSize: 116,
                fontWeight: 900,
                color: COLORS.gold,
                lineHeight: 1.02,
                textTransform: 'uppercase',
                letterSpacing: -2,
              }}
            >
              Socceroos
            </div>
            <div
              style={{
                fontSize: 116,
                fontWeight: 900,
                color: COLORS.white,
                lineHeight: 1.02,
                textTransform: 'uppercase',
                letterSpacing: -2,
              }}
            >
              home ground.
            </div>
            <div
              style={{
                marginTop: 30,
                fontSize: 32,
                fontWeight: 500,
                color: COLORS.goldLight,
                maxWidth: 900,
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
          }}
        >
          <div style={{ display: 'flex' }}>aussiewatchparty.com</div>
          <div style={{ display: 'flex', letterSpacing: 2 }}>GO SOCCEROOS 🦘</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
