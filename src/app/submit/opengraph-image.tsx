import { ImageResponse } from 'next/og';
import { COLORS, OG_CONTENT_TYPE, OG_SIZE, STRIPES_BG } from '@/lib/og';
import { getOgFonts } from '@/lib/og-fonts';

export const runtime = 'nodejs';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'List your Socceroos watch party — free, takes 2 minutes.';

export default async function SubmitOgImage() {
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
          For pubs, clubs & venues
        </div>

        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 118,
                color: COLORS.white,
                lineHeight: 1.0,
                textTransform: 'uppercase',
                fontFamily: 'Archivo Black',
              }}
            >
              Hosting a
            </div>
            <div
              style={{
                fontSize: 118,
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
                fontSize: 118,
                color: COLORS.white,
                lineHeight: 1.0,
                textTransform: 'uppercase',
                fontFamily: 'Archivo Black',
              }}
            >
              watch party?
            </div>
            <div
              style={{
                marginTop: 32,
                fontSize: 30,
                fontWeight: 400,
                color: COLORS.goldLight,
                maxWidth: 900,
                fontFamily: 'Archivo',
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
            fontFamily: 'Archivo',
          }}
        >
          <div style={{ display: 'flex' }}>aussiewatchparty.com/submit</div>
          <div style={{ display: 'flex', letterSpacing: 2 }}>LIST YOUR VENUE →</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
