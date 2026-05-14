'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        setLoading(false);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? 'Login failed.');
          return;
        }
        router.push('/admin/parties');
        router.refresh();
      }}
      className="space-y-3"
    >
      <input
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-aus-green/20 focus:border-aus-green"
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-aus-green text-aus-gold font-display uppercase px-6 py-3 hover:bg-aus-green-700 disabled:opacity-60 transition"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
