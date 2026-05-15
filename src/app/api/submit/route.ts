import { NextResponse } from 'next/server';
import { z } from 'zod';
import { inArray } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { matches as matchesTable, parties } from '@/lib/db/schema';
import { geocodeAddress } from '@/lib/geo/geocode';
import { sendSubmissionReceived } from '@/lib/email/send';

const Schema = z.object({
  matchIds: z.array(z.string().min(1)).min(1).max(8),
  venueName: z.string().min(1).max(200),
  venueLogoUrl: z.string().url().optional().nullable(),
  addressLine: z.string().min(1).max(300),
  city: z.string().min(1).max(120),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}$/),
  hostNotes: z.string().max(2000).optional().nullable(),
  capacity: z.number().int().positive().max(100000).optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  rsvpUrl: z.string().url().optional().nullable(),
  hostName: z.string().min(1).max(200),
  hostEmail: z.string().email().max(200),
  hostPhone: z.string().max(40).optional().nullable(),
  consent: z.literal(true, { message: 'Please tick the consent box to submit.' }),
  // Cloudflare Turnstile token
  turnstileToken: z.string().min(1).max(4096),
  // Honeypot — bots fill this, humans don't see it
  website_url_alt: z.string().max(0).optional().or(z.literal('')).optional(),
});

async function verifyTurnstile(token: string, remoteIp: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) {
    console.warn('TURNSTILE_SECRET missing — accepting submission without verification');
    return true; // dev-friendly fallback
  }
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
  if (!data.success) {
    console.error('Turnstile verify failed', data['error-codes']);
  }
  return data.success;
}

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
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 400 },
    );
  }
  const v = parsed.data;

  // Honeypot: any value here means a bot filled it.
  if (v.website_url_alt && v.website_url_alt.length > 0) {
    return NextResponse.json({ ok: true }); // silent accept; bot won't know
  }

  // Turnstile.
  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0] ?? null;
  const ok = await verifyTurnstile(v.turnstileToken, ip);
  if (!ok) {
    return NextResponse.json({ error: 'Spam check failed. Please refresh and try again.' }, { status: 400 });
  }

  // Resolve all matchIds exist.
  const validMatches = await db
    .select()
    .from(matchesTable)
    .where(inArray(matchesTable.id, v.matchIds));
  if (validMatches.length !== v.matchIds.length) {
    return NextResponse.json({ error: 'One of the selected matches doesn’t exist.' }, { status: 400 });
  }

  // Geocode the address (server-side, single Mapbox call regardless of match count).
  const g = await geocodeAddress(`${v.addressLine}, ${v.city}, ${v.state} ${v.zip}`);
  if (!g) {
    return NextResponse.json(
      { error: 'We couldn’t locate that address. Double-check the spelling and street number.' },
      { status: 422 },
    );
  }

  // One pending party row per selected match (sharing the same host info).
  const sharedBase = {
    venueName: v.venueName,
    venueLogoUrl: v.venueLogoUrl ?? null,
    addressLine: v.addressLine,
    city: v.city,
    state: v.state.toUpperCase(),
    zip: v.zip,
    lat: g.lat,
    lng: g.lng,
    hostNotes: v.hostNotes?.trim() || null,
    capacity: v.capacity ?? null,
    contactEmail: v.contactEmail || null,
    websiteUrl: v.websiteUrl || null,
    rsvpUrl: v.rsvpUrl || null,
    hostName: v.hostName,
    hostEmail: v.hostEmail,
    hostPhone: v.hostPhone || null,
    status: 'pending' as const,
    submittedBy: 'public' as const,
  };

  const created: { id: string; slug: string; matchId: string }[] = [];
  for (const m of validMatches) {
    const id = randomBytes(8).toString('base64url');
    const slug = slugify(v.venueName, v.city);
    await db.insert(parties).values({
      id,
      slug,
      matchId: m.id,
      ...sharedBase,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    created.push({ id, slug, matchId: m.id });
  }

  // Best-effort confirmation email — don't fail the request if email is down.
  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
    try {
      // Use the first created row as the "party" handle in the email; matches list is full.
      const firstId = created[0]?.id;
      if (firstId) {
        const partyRow = (
          await db.select().from(parties).where(inArray(parties.id, [firstId])).limit(1)
        )[0];
        if (partyRow) {
          await sendSubmissionReceived(partyRow, validMatches);
        }
      }
    } catch (err) {
      console.error('Submission-received email failed', err);
    }
  }

  return NextResponse.json({ ok: true, count: created.length });
}
