'use client';
import { useEffect, useState } from 'react';

export type KickoffVariant = 'long' | 'short';

function format(d: Date, variant: KickoffVariant, timeZone?: string) {
  const opts: Intl.DateTimeFormatOptions =
    variant === 'long'
      ? {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        }
      : {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        };
  if (timeZone) opts.timeZone = timeZone;
  return new Intl.DateTimeFormat('en-US', opts).format(d);
}

/**
 * Renders a match kickoff in the visitor's local timezone.
 *
 * SSR renders the time in Eastern Time so the initial HTML is meaningful
 * (no flash of empty content, no layout shift for the rare visitor with JS
 * disabled, and crawlers still see a real time). On hydration we re-format
 * in the visitor's actual timezone via `Intl.DateTimeFormat`, which reads
 * the browser locale.
 *
 * `suppressHydrationWarning` is intentional — the text represents the same
 * instant, just formatted in a different TZ.
 */
export function KickoffTime({
  iso,
  variant = 'long',
}: {
  iso: string;
  variant?: KickoffVariant;
}) {
  const date = new Date(iso);
  const [text, setText] = useState(() => format(date, variant, 'America/New_York'));

  useEffect(() => {
    // Intentional: on hydration we swap the server-rendered ET string for
    // the visitor's actual local timezone. This is the canonical "render
    // in local TZ after hydration" pattern; the alternative
    // (useSyncExternalStore) is overkill for a one-shot swap.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(format(new Date(iso), variant));
  }, [iso, variant]);

  return <span suppressHydrationWarning>{text}</span>;
}
