import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { matchById } from '@/lib/matches';
import { COLORS, OG_CONTENT_TYPE, OG_SIZE, STRIPES_BG, formatKickoffET } from '@/lib/og';

export const runtime = 'nodejs';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// The default `alt` is replaced by `generateImageMetadata` if we had one; for
// now Next.js uses this static export when the page's `<title>` is set.
export const alt = "AUS match — Aussie Watch Party USA";

export default async function MatchOgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await matchById(id);
  if (!match) notFound();

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
            fontSize: 26,
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontWeight: 800,
            color: COLORS.goldLight,
          }}
        >
          {`${match.stage === 'group' ? 'Group D · 2026 Tournament' : 'Knockout · 2026 Tournament'}${match.isTbd ? ' · TBC' : ''}`}
        </div>

        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 900,
                color: COLORS.white,
                lineHeight: 1.02,
                textTransform: 'uppercase',
                letterSpacing: -2,
              }}
            >
              Australia
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: COLORS.goldLight,
                lineHeight: 1.02,
                textTransform: 'uppercase',
                margin: '12px 0',
                letterSpacing: 4,
              }}
            >
              vs
            </div>
            <div
              style={{
                fontSize: 140,
                fontWeight: 900,
                color: COLORS.gold,
                lineHeight: 1.0,
                textTransform: 'uppercase',
                letterSpacing: -3,
              }}
            >
              {match.opponent}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 28,
                fontSize: 28,
                color: COLORS.white,
              }}
            >
              <div style={{ display: 'flex', fontWeight: 600 }}>{formatKickoffET(match.kickoffUtc)}</div>
              {match.venueCity && (
                <div style={{ display: 'flex', marginTop: 6, color: COLORS.goldLight }}>
                  {`${match.venueCity}${match.venueCountry ? `, ${match.venueCountry}` : ''}`}
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
          }}
        >
          <div style={{ display: 'flex' }}>aussiewatchparty.com</div>
          <div style={{ display: 'flex', letterSpacing: 2 }}>FIND A WATCH PARTY →</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
