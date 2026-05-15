import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parties, matches, PARTY_STATUSES } from '@/lib/db/schema';
import { isAuthed } from '@/lib/auth/admin';
import { geocodeAddress } from '@/lib/geo/geocode';
import { sendSubmissionApproved, sendSubmissionRejected } from '@/lib/email/send';

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
  hostName: z.string().max(200).nullable().optional(),
  hostEmail: z.string().email().nullable().optional(),
  hostPhone: z.string().max(40).nullable().optional(),
  status: z.enum(PARTY_STATUSES).optional(),
  rejectionReason: z.string().max(500).optional(),
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
  const oldStatus = existing.status;

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
  if (v.hostName !== undefined) update.hostName = v.hostName;
  if (v.hostEmail !== undefined) update.hostEmail = v.hostEmail;
  if (v.hostPhone !== undefined) update.hostPhone = v.hostPhone;
  if (v.status !== undefined) update.status = v.status;
  if (v.lat !== undefined) update.lat = v.lat;
  if (v.lng !== undefined) update.lng = v.lng;

  if (v.regeocode || v.addressLine || v.city || v.state || v.zip) {
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

  // If admin transitioned a public submission's status, notify the host.
  const newStatus = update.status ?? oldStatus;
  if (existing.submittedBy === 'public' && existing.hostEmail && newStatus !== oldStatus) {
    try {
      const updatedPartyRow = await db
        .select()
        .from(parties)
        .innerJoin(matches, eq(parties.matchId, matches.id))
        .where(eq(parties.id, id))
        .limit(1);
      const merged = updatedPartyRow[0];
      if (merged) {
        const partyForEmail = { ...merged.parties, match: merged.matches };
        if (newStatus === 'published' && oldStatus === 'pending') {
          await sendSubmissionApproved(partyForEmail);
        } else if (newStatus === 'rejected' && oldStatus === 'pending') {
          await sendSubmissionRejected(partyForEmail, v.rejectionReason);
        }
      }
    } catch (err) {
      console.error('Status-transition email failed', err);
    }
  }

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
