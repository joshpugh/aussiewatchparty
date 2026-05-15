import { ImageResponse } from 'next/og';
import { COLORS, OG_CONTENT_TYPE, OG_SIZE, STRIPES_BG } from '@/lib/og';

export const runtime = 'nodejs';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'List your Socceroos watch party — free, takes 2 minutes.';

export default async function SubmitOgImage() {
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
          For pubs, clubs & venues
        </div>

        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 110,
                fontWeight: 900,
                color: COLORS.white,
                lineHeight: 1.02,
                textTransform: 'uppercase',
                letterSpacing: -2,
              }}
            >
              Hosting a
            </div>
            <div
              style={{
                fontSize: 110,
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
                fontSize: 110,
                fontWeight: 900,
                color: COLORS.white,
                lineHeight: 1.02,
                textTransform: 'uppercase',
                letterSpacing: -2,
              }}
            >
              watch party?
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: 30,
                fontWeight: 500,
                color: COLORS.goldLight,
                maxWidth: 900,
              }}
            >
              Free to list. Two minutes. Email alerts when fans RSVP.
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
          <div style={{ display: 'flex' }}>aussiewatchparty.com/submit</div>
          <div style={{ display: 'flex', letterSpacing: 2 }}>LIST YOUR VENUE →</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
