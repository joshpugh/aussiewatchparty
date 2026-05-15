import Link from 'next/link';
import { isAuthed } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

/**
 * Admin chrome only. The login page hides the nav; protected pages call
 * `await requireAdmin()` themselves and redirect to /admin/login if needed.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthed();
  return (
    <div className="min-h-full">
      {authed && (
        <div className="bg-aus-ink text-white">
          <div className="mx-auto max-w-5xl px-4 py-2 text-xs flex items-center justify-between">
            <span className="font-display uppercase tracking-widest text-aus-gold">
              Admin
            </span>
            <nav className="flex items-center gap-4">
              <Link href="/admin/parties" className="hover:underline">
                Watch parties
              </Link>
              <Link href="/admin/rsvps" className="hover:underline">
                RSVPs
              </Link>
              <form action="/api/admin/logout" method="post">
                <button className="hover:underline text-aus-gold-200" type="submit">
                  Log out
                </button>
              </form>
            </nav>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
