/**
 * Loads Archivo + Archivo Black from bundled TTFs so `next/og`'s
 * ImageResponse renders at the right weight.
 *
 * Without registered fonts, satori falls back to a generic sans-serif
 * and ignores `fontWeight` entirely — that's what was making the OG
 * images look thin and off-brand.
 *
 * Why static TTFs in the repo (`src/fonts/`):
 *   - Satori cannot decode woff2 (the format Google Fonts serves to
 *     modern clients), so the css2 API is unusable directly.
 *   - It also struggles with some variable fonts (e.g. Inter's
 *     `Inter[opsz,wght].ttf` 500'd in satori).
 *   - Static TTFs from the Omnibus-Type Archivo family work cleanly
 *     and match the on-site brand (Inter on the site, Archivo across
 *     the OG images — Archivo is the source family Inter inherited
 *     proportions from, so they look closely related).
 *
 * Buffers are read once at module load and cached for subsequent
 * renders in the same serverless invocation.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: 'normal';
};

const FONTS_DIR = path.join(process.cwd(), 'src/fonts');

let cached: OgFont[] | null = null;

export async function getOgFonts(): Promise<OgFont[]> {
  if (cached) return cached;
  const [black, regular, bold] = await Promise.all([
    readFile(path.join(FONTS_DIR, 'ArchivoBlack-Regular.ttf')),
    readFile(path.join(FONTS_DIR, 'Archivo-Regular.ttf')),
    readFile(path.join(FONTS_DIR, 'Archivo-Bold.ttf')),
  ]);
  cached = [
    { name: 'Archivo Black', data: black, weight: 400, style: 'normal' },
    { name: 'Archivo', data: regular, weight: 400, style: 'normal' },
    { name: 'Archivo', data: bold, weight: 700, style: 'normal' },
  ];
  return cached;
}
