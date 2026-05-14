import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parties } from '@/lib/db/schema';
import { isAuthed } from '@/lib/auth/admin';
import { geocodeAddress } from '@/lib/geo/geocode';

const PatchSchema = z.object({
  matchId: z.string().min(1).optional(),
  venueName: z.string().min(1).max(200).optional(),
  venueLogoUrl: z.string().url().nullable().optional(),
  addressLine: z.string().min(1).max(300).optional(),
  city: z.string().min(1).max(120).optional(),
  state: z.string().length(2).optional(),
  zip: z.string().regex(/^\d{5}$/).optional(),
  hostNotes: z.string().max(2000).nullable().optional(),
  capacity: z.number().int().positive().nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  websiteUrl: z.string().url().nullable().optional(),
  isPublished: z.boolean().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  regeocode: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 400 },
    );
  }
  const v = parsed.data;

  const current = await db.select().from(parties).where(eq(parties.id, id)).limit(1);
  if (current.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const existing = current[0];

  const update: Partial<typeof parties.$inferInsert> = { updatedAt: new Date() };
  if (v.matchId !== undefined) update.matchId = v.matchId;
  if (v.venueName !== undefined) update.venueName = v.venueName;
  if (v.venueLogoUrl !== undefined) update.venueLogoUrl = v.venueLogoUrl;
  if (v.addressLine !== undefined) update.addressLine = v.addressLine;
  if (v.city !== undefined) update.city = v.city;
  if (v.state !== undefined) update.state = v.state.toUpperCase();
  if (v.zip !== undefined) update.zip = v.zip;
  if (v.hostNotes !== undefined) update.hostNotes = v.hostNotes;
  if (v.capacity !== undefined) update.capacity = v.capacity;
  if (v.contactEmail !== undefined) update.contactEmail = v.contactEmail;
  if (v.websiteUrl !== undefined) update.websiteUrl = v.websiteUrl;
  if (v.isPublished !== undefined) update.isPublished = v.isPublished;

  if (v.lat !== undefined) update.lat = v.lat;
  if (v.lng !== undefined) update.lng = v.lng;

  if (v.regeocode || (v.addressLine || v.city || v.state || v.zip)) {
    const next = {
      addressLine: update.addressLine ?? existing.addressLine,
      city: update.city ?? existing.city,
      state: update.state ?? existing.state,
      zip: update.zip ?? existing.zip,
    };
    if (v.lat === undefined && v.lng === undefined) {
      const g = await geocodeAddress(
        `${next.addressLine}, ${next.city}, ${next.state} ${next.zip}`,
      );
      if (g) {
        update.lat = g.lat;
        update.lng = g.lng;
      }
    }
  }

  await db.update(parties).set(update).where(eq(parties.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await db.delete(parties).where(eq(parties.id, id));
  return NextResponse.json({ ok: true });
}
