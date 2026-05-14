'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Match, Party } from '@/lib/db/schema';

type Props = {
  matches: Match[];
  party?: Party;
};

const input =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-aus-green/20 focus:border-aus-green';

export function PartyForm({ matches, party }: Props) {
  const router = useRouter();
  const isEdit = !!party;
  const [logoUrl, setLogoUrl] = useState<string | null>(party?.venueLogoUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadLogo(file: File) {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Upload failed.');
      return;
    }
    const data = (await res.json()) as { url: string };
    setLogoUrl(data.url);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      matchId: String(fd.get('matchId')),
      venueName: String(fd.get('venueName')).trim(),
      venueLogoUrl: logoUrl,
      addressLine: String(fd.get('addressLine')).trim(),
      city: String(fd.get('city')).trim(),
      state: String(fd.get('state')).trim().toUpperCase(),
      zip: String(fd.get('zip')).trim(),
      hostNotes: String(fd.get('hostNotes') ?? '').trim() || null,
      capacity: fd.get('capacity') ? Number(fd.get('capacity')) : null,
      contactEmail: String(fd.get('contactEmail') ?? '').trim() || null,
      websiteUrl: String(fd.get('websiteUrl') ?? '').trim() || null,
      isPublished: fd.get('isPublished') === 'on',
    };
    const latStr = String(fd.get('lat') ?? '').trim();
    const lngStr = String(fd.get('lng') ?? '').trim();
    if (latStr && lngStr) {
      payload.lat = Number(latStr);
      payload.lng = Number(lngStr);
    }
    if (isEdit) payload.regeocode = !latStr && !lngStr;

    const url = isEdit ? `/api/admin/parties/${party!.id}` : `/api/admin/parties`;
    const method = isEdit ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Save failed.');
      return;
    }
    router.push('/admin/parties');
    router.refresh();
  }

  async function onDelete() {
    if (!party) return;
    if (!confirm(`Delete "${party.venueName}"? This also removes its RSVPs.`)) return;
    await fetch(`/api/admin/parties/${party.id}`, { method: 'DELETE' });
    router.push('/admin/parties');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase text-neutral-600">Match</span>
          <select
            name="matchId"
            required
            defaultValue={party?.matchId}
            className={`mt-1 ${input}`}
          >
            <option value="">Pick a match…</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                AUS vs {m.opponent} — {new Date(m.kickoffUtc).toLocaleString()}
                {m.isTbd ? ' (TBC)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-neutral-600">Venue name</span>
          <input
            name="venueName"
            required
            maxLength={200}
            defaultValue={party?.venueName}
            className={`mt-1 ${input}`}
          />
        </label>

        <div>
          <span className="text-xs font-semibold uppercase text-neutral-600">Venue logo</span>
          <div className="mt-1 flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="logo" className="h-12 w-12 rounded-lg object-cover bg-neutral-100" />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-neutral-100" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadLogo(file);
              }}
              className="text-sm"
            />
            {uploading && <span className="text-xs text-neutral-500">Uploading…</span>}
            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl(null)}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase text-neutral-600">Address</span>
          <input
            name="addressLine"
            required
            maxLength={300}
            defaultValue={party?.addressLine}
            className={`mt-1 ${input}`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-neutral-600">City</span>
          <input name="city" required maxLength={120} defaultValue={party?.city} className={`mt-1 ${input}`} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-neutral-600">State</span>
            <input
              name="state"
              required
              maxLength={2}
              defaultValue={party?.state}
              className={`mt-1 ${input}`}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase text-neutral-600">ZIP</span>
            <input
              name="zip"
              required
              pattern="\d{5}"
              maxLength={5}
              defaultValue={party?.zip}
              className={`mt-1 ${input}`}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-neutral-600">Lat (optional)</span>
          <input name="lat" type="number" step="any" defaultValue={party?.lat} className={`mt-1 ${input}`} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-neutral-600">Lng (optional)</span>
          <input name="lng" type="number" step="any" defaultValue={party?.lng} className={`mt-1 ${input}`} />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-neutral-600">Capacity (optional)</span>
          <input
            name="capacity"
            type="number"
            min={1}
            defaultValue={party?.capacity ?? ''}
            className={`mt-1 ${input}`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-neutral-600">Contact email</span>
          <input
            name="contactEmail"
            type="email"
            defaultValue={party?.contactEmail ?? ''}
            className={`mt-1 ${input}`}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase text-neutral-600">Website</span>
          <input
            name="websiteUrl"
            type="url"
            defaultValue={party?.websiteUrl ?? ''}
            className={`mt-1 ${input}`}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase text-neutral-600">Host notes (optional)</span>
          <textarea
            name="hostNotes"
            maxLength={2000}
            rows={3}
            defaultValue={party?.hostNotes ?? ''}
            className={`mt-1 ${input}`}
          />
        </label>

        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={party?.isPublished ?? true}
            className="h-4 w-4 accent-aus-green"
          />
          <span className="text-sm">Show this party on the public site</span>
        </label>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <div>
          {isEdit && (
            <button
              type="button"
              onClick={onDelete}
              className="text-sm text-red-600 hover:underline"
            >
              Delete party
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-lg bg-aus-green text-aus-gold font-display uppercase px-6 py-3 hover:bg-aus-green-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create party'}
        </button>
      </div>
    </form>
  );
}
