'use client';
import { useState } from 'react';

export function RsvpForm({ partyId }: { partyId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      partyId,
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      partySize: Number(fd.get('partySize') ?? 1),
      consent: fd.get('consent') === 'on',
    };
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Something went wrong.');
      }
      setStatus('ok');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  if (status === 'ok') {
    return (
      <div className="rounded-xl bg-aus-green text-aus-gold p-5">
        <p className="font-display text-xl uppercase">You&apos;re in! 🦘</p>
        <p className="mt-1 text-aus-gold-200 text-sm">
          We sent a confirmation to your inbox. See you on match day.
        </p>
      </div>
    );
  }

  const input =
    'w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base focus:outline-none focus:ring-4 focus:ring-aus-green/20 focus:border-aus-green';

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">Your name</span>
          <input name="name" required maxLength={120} className={`mt-1 ${input}`} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            className={`mt-1 ${input}`}
          />
        </label>
      </div>
      <label className="block max-w-[12rem]">
        <span className="text-sm font-semibold">Party size</span>
        <input
          name="partySize"
          type="number"
          min={1}
          max={50}
          defaultValue={1}
          required
          className={`mt-1 ${input}`}
        />
      </label>

      <label className="flex items-start gap-3 text-sm text-neutral-700">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-aus-green" />
        <span>
          I&apos;m happy to receive a confirmation and one reminder email about this watch party.
          We won&apos;t spam you and we won&apos;t share your details.
        </span>
      </label>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-lg bg-aus-green text-aus-gold font-display uppercase px-6 py-3 hover:bg-aus-green-700 disabled:opacity-60 transition"
      >
        {status === 'loading' ? 'Locking it in…' : "I'm in"}
      </button>
    </form>
  );
}
