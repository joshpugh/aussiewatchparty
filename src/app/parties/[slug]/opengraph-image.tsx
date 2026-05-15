import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { partyBySlug } from '@/lib/parties';
import { COLORS, OG_CONTENT_TYPE, OG_SIZE, STRIPES_BG, formatKickoffET } from '@/lib/og';
import { getOgFonts } from '@/lib/og-fonts';

export const runtime = 'nodejs';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Socceroos watch party — Aussie Watch Party USA';

export default async function PartyOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await partyBySlug(slug);
  if (!p) notFound();
  const fonts = await getOgFonts();

  // Scale venue name to fit, since names vary widely.
  const nameLen = p.venueName.length;
  const venueFontSize = nameLen > 24 ? 92 : nameLen > 16 ? 112 : 134;

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
          {`Watch Party · ${p.city}, ${p.state}`}
        </div>

        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: venueFontSize,
                color: COLORS.white,
                lineHeight: 1.0,
                textTransform: 'uppercase',
                maxWidth: 1040,
                fontFamily: 'Archivo Black',
              }}
            >
              {p.venueName}
            </div>
            <div
              style={{
                marginTop: 30,
                fontSize: 58,
                color: COLORS.gold,
                lineHeight: 1.0,
                textTransform: 'uppercase',
                fontFamily: 'Archivo Black',
              }}
            >
              {`AUS vs ${p.match.opponent}`}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 14,
                fontSize: 28,
                color: COLORS.white,
                fontWeight: 700,
                fontFamily: 'Archivo',
              }}
            >
              {formatKickoffET(p.match.kickoffUtc)}
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
          <div style={{ display: 'flex', letterSpacing: 2 }}>RSVP — FREE</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
