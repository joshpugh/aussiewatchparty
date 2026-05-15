'use client';
import { useEffect, useRef, useState } from 'react';
import type { Match } from '@/lib/db/schema';

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const TURNSTILE_SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY;

const input =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-aus-green/20 focus:border-aus-green';

function formatKickoff(d: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function SubmitForm({ matches }: { matches: Match[] }) {
  // Public submitters can't upload a logo (we don't want anonymous writes to
  // Blob). Admin adds the logo after approval. Field is hidden from the form.
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Initialise Turnstile once the script has loaded.
  useEffect(() => {
    if (!TURNSTILE_SITEKEY) return;

    function init() {
      if (!window.turnstile || !turnstileRef.current || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITEKEY!,
        callback: (token) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(null),
        'error-callback': () => setTurnstileToken(null),
      });
    }

    if (window.turnstile) {
      init();
    } else {
      window.onTurnstileLoad = init;
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (TURNSTILE_SITEKEY && !turnstileToken) {
      setError('Just hold on a tick — the spam check is still loading.');
      return;
    }

    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const matchIds = fd.getAll('matchIds').map(String).filter(Boolean);
    if (matchIds.length === 0) {
      setSubmitting(false);
      setError('Pick at least one match you’ll be showing.');
      return;
    }

    const payload = {
      matchIds,
      venueName: String(fd.get('venueName') ?? '').trim(),
      venueLogoUrl: null,
      addressLine: String(fd.get('addressLine') ?? '').trim(),
      city: String(fd.get('city') ?? '').trim(),
      state: String(fd.get('state') ?? '').trim().toUpperCase(),
      zip: String(fd.get('zip') ?? '').trim(),
      hostNotes: String(fd.get('hostNotes') ?? '').trim() || null,
      capacity: fd.get('capacity') ? Number(fd.get('capacity')) : null,
      contactEmail: String(fd.get('contactEmail') ?? '').trim() || null,
      websiteUrl: String(fd.get('websiteUrl') ?? '').trim() || null,
      rsvpUrl: String(fd.get('rsvpUrl') ?? '').trim() || null,
      hostName: String(fd.get('hostName') ?? '').trim(),
      hostEmail: String(fd.get('hostEmail') ?? '').trim(),
      hostPhone: String(fd.get('hostPhone') ?? '').trim() || null,
      consent: fd.get('consent') === 'on',
      turnstileToken: turnstileToken ?? '',
      website_url_alt: String(fd.get('website_url_alt') ?? ''),
    };

    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Submission failed.');
      // Reset Turnstile so a new token is generated for retry
      if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
      setTurnstileToken(null);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-aus-green/30 bg-aus-cream/40 p-6">
        <p className="font-display text-2xl uppercase text-aus-green">Got it. Thanks, mate.</p>
        <p className="mt-2 text-neutral-700 leading-relaxed">
          We&apos;ll review your submission within 24 hours. Keep an eye on your inbox — you&apos;ll
          get an email when it&apos;s live (or if we need to clarify anything).
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Turnstile script — loads once per page */}
      {TURNSTILE_SITEKEY && (
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit"
          async
          defer
        ></script>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Matches */}
        <fieldset>
          <legend className="text-sm font-semibold text-aus-ink">
            Which matches are you hosting?
            <span className="text-red-600"> *</span>
          </legend>
          <p className="text-xs text-neutral-500 mt-0.5">Tick as many as apply.</p>
          <div className="mt-3 grid gap-2">
            {matches.map((m) => (
              <label
                key={m.id}
                className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3 cursor-pointer hover:border-aus-green/40"
              >
                <input
                  type="checkbox"
                  name="matchIds"
                  value={m.id}
                  className="mt-1 h-4 w-4 accent-aus-green"
                />
                <div className="text-sm">
                  <div className="font-semibold">AUS vs {m.opponent}</div>
                  <div className="text-neutral-600 text-xs">
                    {formatKickoff(m.kickoffUtc)}
                    {m.venueCity && ` · ${m.venueCity}`}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Venue */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-aus-ink">About the venue</legend>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-neutral-600">
              Venue name <span className="text-red-600">*</span>
            </span>
            <input name="venueName" required maxLength={200} className={`mt-1 ${input}`} />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-neutral-600">
              Street address <span className="text-red-600">*</span>
            </span>
            <input name="addressLine" required maxLength={300} className={`mt-1 ${input}`} />
          </label>

          <div className="grid gap-3 sm:grid-cols-[1fr_120px_120px]">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-neutral-600">
                City <span className="text-red-600">*</span>
              </span>
              <input name="city" required maxLength={120} className={`mt-1 ${input}`} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-neutral-600">
                State <span className="text-red-600">*</span>
              </span>
              <input name="state" required maxLength={2} placeholder="CA" className={`mt-1 ${input}`} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-neutral-600">
                ZIP <span className="text-red-600">*</span>
              </span>
              <input name="zip" required pattern="\d{5}" maxLength={5} className={`mt-1 ${input}`} />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-neutral-600">Capacity</span>
              <input name="capacity" type="number" min={1} max={100000} className={`mt-1 ${input}`} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-neutral-600">Venue website</span>
              <input name="websiteUrl" type="url" placeholder="https://" className={`mt-1 ${input}`} />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-neutral-600">Public contact email</span>
            <p className="text-xs text-neutral-500">Shown on the watch party page for attendees. Optional.</p>
            <input name="contactEmail" type="email" className={`mt-1 ${input}`} />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-neutral-600">Anything attendees should know?</span>
            <p className="text-xs text-neutral-500">Bookings, food specials, opening time, parking — keep it short.</p>
            <textarea name="hostNotes" maxLength={500} rows={3} className={`mt-1 ${input}`} />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-neutral-600">
              Already using your own booking platform?
            </span>
            <p className="text-xs text-neutral-500">
              Paste your Eventbrite, OpenTable, Resy or other booking link and we&apos;ll point fans
              straight there instead of running RSVPs ourselves. Leave blank to let us collect
              RSVPs for you (you&apos;ll get an email for each one).
            </p>
            <input
              name="rsvpUrl"
              type="url"
              placeholder="https://eventbrite.com/..."
              className={`mt-1 ${input}`}
            />
          </label>
        </fieldset>

        {/* Host (private) */}
        <fieldset className="space-y-3 border-t border-neutral-200 pt-4">
          <legend className="text-sm font-semibold text-aus-ink">
            About you (private — not shown publicly)
          </legend>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-neutral-600">
                Your name <span className="text-red-600">*</span>
              </span>
              <input name="hostName" required maxLength={200} className={`mt-1 ${input}`} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-neutral-600">
                Your email <span className="text-red-600">*</span>
              </span>
              <input
                name="hostEmail"
                type="email"
                required
                maxLength={200}
                placeholder="we send RSVP alerts here"
                className={`mt-1 ${input}`}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold uppercase text-neutral-600">Phone (optional)</span>
            <input name="hostPhone" maxLength={40} className={`mt-1 ${input}`} />
          </label>
        </fieldset>

        {/* Honeypot — hidden from humans, bots love these */}
        <div className="hidden" aria-hidden="true">
          <label>
            Leave this empty
            <input type="text" name="website_url_alt" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {/* Consent */}
        <label className="flex items-start gap-3 text-sm text-neutral-700">
          <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-aus-green" />
          <span>
            I confirm this watch party is real, I&apos;m authorised to list it, and I&apos;m happy
            to receive RSVP notifications by email.
          </span>
        </label>

        {/* Turnstile */}
        {TURNSTILE_SITEKEY ? (
          <div ref={turnstileRef} className="cf-turnstile" />
        ) : (
          <p className="text-xs text-neutral-500">
            (Anti-spam check disabled — NEXT_PUBLIC_TURNSTILE_SITEKEY not configured.)
          </p>
        )}

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-aus-green text-aus-gold font-display uppercase px-6 py-3 hover:bg-aus-green-700 disabled:opacity-60 transition"
        >
          {submitting ? 'Submitting…' : 'Submit watch party'}
        </button>
      </form>
    </>
  );
}
