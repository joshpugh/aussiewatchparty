'use client';
import { useEffect, useState } from 'react';

function diffParts(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function Countdown({ targetIso }: { targetIso: string }) {
  const [t, setT] = useState(() => diffParts(new Date(targetIso)));

  useEffect(() => {
    const target = new Date(targetIso);
    const id = setInterval(() => setT(diffParts(target)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  const cell = (n: number, label: string) => (
    <div className="text-center">
      <div className="font-display text-3xl sm:text-5xl text-aus-gold tabular-nums leading-none">
        {String(n).padStart(2, '0')}
      </div>
      <div className="mt-1 text-[10px] sm:text-xs tracking-widest uppercase text-aus-gold-200">
        {label}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-6">
      {cell(t.days, 'Days')}
      {cell(t.hours, 'Hrs')}
      {cell(t.minutes, 'Min')}
      {cell(t.seconds, 'Sec')}
    </div>
  );
}
