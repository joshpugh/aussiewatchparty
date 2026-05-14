import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminSession, verifyAdminPassword } from '@/lib/auth/admin';

const Schema = z.object({ password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const data = await req.json().catch(() => null);
  const parsed = Schema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Password required.' }, { status: 400 });
  }
  if (!verifyAdminPassword(parsed.data.password)) {
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
