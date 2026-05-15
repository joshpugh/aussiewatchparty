import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { matchById } from '@/lib/matches';
import { COLORS, OG_CONTENT_TYPE, OG_SIZE, STRIPES_BG, formatKickoffET } from '@/lib/og';
import { getOgFonts } from '@/lib/og-fonts';

export const runtime = 'nodejs';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'AUS match — Aussie Watch Party USA';

export default async function MatchOgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await matchById(id);
  if (!match) notFound();
  const fonts = await getOgFonts();

  // Scale the opponent name down if it's longer than expected.
  const opponentSize = match.opponent.length > 16 ? 110 : match.opponent.length > 10 ? 130 : 150;

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
          {`${match.stage === 'group' ? 'Group D · 2026 Tournament' : 'Knockout · 2026 Tournament'}${match.isTbd ? ' · TBC' : ''}`}
        </div>

        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 96,
                color: COLORS.white,
                lineHeight: 1.0,
                textTransform: 'uppercase',
                fontFamily: 'Archivo Black',
              }}
            >
              Australia
            </div>
            <div
              style={{
                fontSize: 50,
                fontWeight: 700,
                color: COLORS.goldLight,
                lineHeight: 1.0,
                textTransform: 'uppercase',
                margin: '14px 0',
                letterSpacing: 6,
                fontFamily: 'Archivo',
              }}
            >
              vs
            </div>
            <div
              style={{
                fontSize: opponentSize,
                color: COLORS.gold,
                lineHeight: 1.0,
                textTransform: 'uppercase',
                fontFamily: 'Archivo Black',
              }}
            >
              {match.opponent}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 32,
                color: COLORS.white,
                fontFamily: 'Archivo',
              }}
            >
              <div style={{ display: 'flex', fontSize: 28, fontWeight: 700 }}>
                {formatKickoffET(match.kickoffUtc)}
              </div>
              {(match.venueStadium || match.venueCity) && (
                <div
                  style={{
                    display: 'flex',
                    marginTop: 6,
                    color: COLORS.goldLight,
                    fontSize: 26,
                    fontWeight: 400,
                  }}
                >
                  {match.venueStadium
                    ? `${match.venueStadium}${match.venueCity ? ` · ${match.venueCity}` : ''}`
                    : `${match.venueCity}${match.venueCountry ? `, ${match.venueCountry}` : ''}`}
                </div>
              )}
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
          <div style={{ display: 'flex', letterSpacing: 2 }}>FIND A WATCH PARTY →</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
