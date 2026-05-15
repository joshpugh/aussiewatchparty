'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Match, Party, PartyStatus } from '@/lib/db/schema';

type Props = {
  matches: Match[];
  party?: Party;
};

const input =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-aus-green/20 focus:border-aus-green';

export function PartyForm({ matches, party }: Props) {
  const router = useRouter();
  const isEdit = !!party;
  const isPublicSubmission = party?.submittedBy === 'public';
  const [logoUrl, setLogoUrl] = useState<string | null>(party?.venueLogoUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

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

  async function submit(payload: Record<string, unknown>) {
    setSaving(true);
    setError(null);
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
      return false;
    }
    router.push('/admin/parties');
    router.refresh();
    return true;
  }

  function gatherForm(form: HTMLFormElement): Record<string, unknown> {
    const fd = new FormData(form);
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
      rsvpUrl: String(fd.get('rsvpUrl') ?? '').trim() || null,
      hostName: String(fd.get('hostName') ?? '').trim() || null,
      hostEmail: String(fd.get('hostEmail') ?? '').trim() || null,
      hostPhone: String(fd.get('hostPhone') ?? '').trim() || null,
      status: String(fd.get('status') ?? 'published') as PartyStatus,
    };
    const latStr = String(fd.get('lat') ?? '').trim();
    const lngStr = String(fd.get('lng') ?? '').trim();
    if (latStr && lngStr) {
      payload.lat = Number(latStr);
      payload.lng = Number(lngStr);
    }
    if (isEdit) payload.regeocode = !latStr && !lngStr;
    return payload;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await submit(gatherForm(e.currentTarget));
  }

  async function quickApprove() {
    if (!party) return;
    await submit({ status: 'published' });
  }

  async function quickReject() {
    if (!party) return;
    if (!confirm('Reject this submission? The host will be emailed.')) return;
    await submit({ status: 'rejected', rejectionReason: rejectionReason.trim() || undefined });
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
      {/* Submission banner */}
      {isPublicSubmission && party?.status === 'pending' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-semibold text-amber-900">Public submission · awaiting review</p>
          <p className="mt-1 text-amber-800">
            Submitted by <strong>{party.hostName ?? 'Unknown'}</strong>
            {party.hostEmail && (
              <>
                {' '}(<a className="underline" href={`mailto:${party.hostEmail}`}>{party.hostEmail}</a>)
              </>
            )}
            {party.hostPhone && <> · {party.hostPhone}</>}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={quickApprove}
              disabled={saving}
              className="rounded-lg bg-aus-green text-aus-gold font-display uppercase px-4 py-2 hover:bg-aus-green-700 disabled:opacity-60"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={quickReject}
              disabled={saving}
              className="rounded-lg bg-white text-red-700 border border-red-300 font-display uppercase px-4 py-2 hover:bg-red-50 disabled:opacity-60"
            >
              Reject
            </button>
            <input
              type="text"
              placeholder="Optional reason for rejection (emailed to host)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="flex-1 min-w-[200px] rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

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
          <span className="text-xs font-semibold uppercase text-neutral-600">Public contact email</span>
          <input
            name="contactEmail"
            type="email"
            defaultValue={party?.contactEmail ?? ''}
            className={`mt-1 ${input}`}
            placeholder="Shown to attendees (optional)"
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
          <span className="text-xs font-semibold uppercase text-neutral-600">External RSVP URL</span>
          <p className="text-xs text-neutral-500 mt-0.5">
            If set, the party page hides our RSVP form and shows a button linking here
            (Eventbrite, OpenTable, the venue&apos;s own booking page, etc.).
          </p>
          <input
            name="rsvpUrl"
            type="url"
            placeholder="https://eventbrite.com/..."
            defaultValue={party?.rsvpUrl ?? ''}
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

        {/* Private host fields */}
        <div className="sm:col-span-2 pt-2 border-t border-neutral-200">
          <p className="text-xs font-semibold uppercase text-neutral-500">Private host contact (not shown publicly)</p>
        </div>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-neutral-600">Host name</span>
          <input
            name="hostName"
            maxLength={200}
            defaultValue={party?.hostName ?? ''}
            className={`mt-1 ${input}`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-neutral-600">Host email (for RSVP alerts)</span>
          <input
            name="hostEmail"
            type="email"
            defaultValue={party?.hostEmail ?? ''}
            className={`mt-1 ${input}`}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase text-neutral-600">Host phone (optional)</span>
          <input
            name="hostPhone"
            maxLength={40}
            defaultValue={party?.hostPhone ?? ''}
            className={`mt-1 ${input}`}
          />
        </label>

        {/* Status */}
        <div className="sm:col-span-2 pt-2 border-t border-neutral-200">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-neutral-600">Status</span>
            <select
              name="status"
              defaultValue={party?.status ?? 'published'}
              className={`mt-1 ${input}`}
            >
              <option value="pending">Pending — not shown publicly</option>
              <option value="published">Live — shown on the site</option>
              <option value="rejected">Rejected — hidden</option>
            </select>
          </label>
        </div>
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
              Delete watch party
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-lg bg-aus-green text-aus-gold font-display uppercase px-6 py-3 hover:bg-aus-green-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create watch party'}
        </button>
      </div>
    </form>
  );
}
