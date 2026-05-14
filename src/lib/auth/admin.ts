import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { db } from '@/lib/db';
import { adminSessions } from '@/lib/db/schema';

export const ADMIN_COOKIE = 'swp_admin';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error('ADMIN_PASSWORD is not set');
  return pw;
}

export function verifyAdminPassword(input: string): boolean {
  const expected = Buffer.from(getAdminPassword(), 'utf8');
  const given = Buffer.from(input ?? '', 'utf8');
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

export async function createAdminSession() {
  const id = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(adminSessions).values({ id, expiresAt });

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroyAdminSession() {
  const jar = await cookies();
  const sid = jar.get(ADMIN_COOKIE)?.value;
  if (sid) {
    await db.delete(adminSessions).where(eq(adminSessions.id, sid));
  }
  jar.delete(ADMIN_COOKIE);
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  const sid = jar.get(ADMIN_COOKIE)?.value;
  if (!sid) return false;
  const rows = await db
    .select({ id: adminSessions.id, expiresAt: adminSessions.expiresAt })
    .from(adminSessions)
    .where(eq(adminSessions.id, sid))
    .limit(1);
  if (rows.length === 0) return false;
  return rows[0].expiresAt.getTime() > Date.now();
}

/**
 * Call at the top of any server component / route that requires admin.
 * Redirects to /admin/login when not authed.
 */
export async function requireAdmin() {
  if (!(await isAuthed())) {
    redirect('/admin/login');
  }
}
