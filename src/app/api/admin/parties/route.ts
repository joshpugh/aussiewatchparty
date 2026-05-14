import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { parties } from '@/lib/db/schema';
import { isAuthed } from '@/lib/auth/admin';
import { geocodeAddress } from '@/lib/geo/geocode';

const Schema = z.object({
  matchId: z.string().min(1),
  venueName: z.string().min(1).max(200),
  venueLogoUrl: z.string().url().optional().nullable(),
  addressLine: z.string().min(1).max(300),
  city: z.string().min(1).max(120),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}$/),
  hostNotes: z.string().max(2000).optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  isPublished: z.boolean().default(true),
  // Optional manual override if geocode fails:
  lat: z.number().optional(),
  lng: z.number().optional(),
});

function slugify(name: string, city: string) {
  const base = `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const tail = randomBytes(3).toString('hex');
  return `${base}-${tail}`;
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 400 },
    );
  }
  const v = parsed.data;

  let { lat, lng } = v;
  if (lat == null || lng == null) {
    const g = await geocodeAddress(`${v.addressLine}, ${v.city}, ${v.state} ${v.zip}`);
    if (!g) {
      return NextResponse.json(
        {
          error:
            'Could not geocode address. Either fix it, or supply lat & lng explicitly in this request.',
        },
        { status: 422 },
      );
    }
    lat = g.lat;
    lng = g.lng;
  }

  const id = randomBytes(8).toString('base64url');
  const slug = slugify(v.venueName, v.city);

  await db.insert(parties).values({
    id,
    slug,
    matchId: v.matchId,
    venueName: v.venueName,
    venueLogoUrl: v.venueLogoUrl ?? null,
    addressLine: v.addressLine,
    city: v.city,
    state: v.state.toUpperCase(),
    zip: v.zip,
    lat,
    lng,
    hostNotes: v.hostNotes ?? null,
    capacity: v.capacity ?? null,
    contactEmail: v.contactEmail ?? null,
    websiteUrl: v.websiteUrl ?? null,
    isPublished: v.isPublished,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({ ok: true, id, slug });
}
