'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function ZipSearch({ initial }: { initial?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [zip, setZip] = useState(initial ?? params.get('zip') ?? '');
  const [pending, setPending] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const clean = zip.trim().slice(0, 5);
        if (!/^\d{5}$/.test(clean)) return;
        setPending(true);
        router.push(`/?zip=${clean}#parties`);
        setTimeout(() => setPending(false), 800);
      }}
      className="flex items-stretch gap-2 w-full max-w-md"
    >
      <input
        inputMode="numeric"
        pattern="[0-9]{5}"
        maxLength={5}
        autoComplete="postal-code"
        placeholder="Your ZIP"
        value={zip}
        onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
        className="flex-1 rounded-lg border-2 border-aus-gold bg-white px-4 py-3 text-lg font-semibold text-aus-ink placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-aus-gold/40"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-aus-gold px-5 py-3 font-display uppercase text-aus-ink hover:bg-aus-gold-200 transition disabled:opacity-60"
      >
        {pending ? '…' : 'Find'}
      </button>
    </form>
  );
}
