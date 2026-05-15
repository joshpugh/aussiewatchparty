'use client';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export type MapParty = {
  slug: string;
  venueName: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  matchOpponent: string;
};

function formatPopup(p: MapParty) {
  return `
    <div style="font-family: var(--font-sans), -apple-system, system-ui, sans-serif; min-width: 200px">
      <div style="font-family: var(--font-display), 'Archivo Black', sans-serif; text-transform: uppercase; font-size: 14px; line-height: 1.15; color: #0A0A0A">
        ${escapeHtml(p.venueName)}
      </div>
      <div style="color: #525252; font-size: 12px; margin-top: 2px">
        ${escapeHtml(p.city)}, ${escapeHtml(p.state)}
      </div>
      <div style="color: #525252; font-size: 12px; margin-top: 6px">
        vs <strong style="color: #0A0A0A">${escapeHtml(p.matchOpponent)}</strong>
      </div>
      <a href="/parties/${encodeURIComponent(p.slug)}"
         style="display:inline-block; margin-top: 10px; padding: 6px 10px; background: #00843D; color: #FFCD00; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 12px">
        View party →
      </a>
    </div>
  `;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function PartiesMap({ parties }: { parties: MapParty[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [missingToken, setMissingToken] = useState(false);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setMissingToken(true);
      return;
    }
    mapboxgl.accessToken = token;

    if (!containerRef.current) return;

    // Centre of continental US, zoom out
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-95.7129, 37.0902],
      zoom: 3.4,
      attributionControl: true,
      cooperativeGestures: true, // scroll-zoom requires ctrl on desktop, two fingers on mobile
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    const markers: mapboxgl.Marker[] = [];
    const bounds = new mapboxgl.LngLatBounds();

    for (const p of parties) {
      const el = document.createElement('div');
      el.className = 'swp-marker';
      el.setAttribute('aria-label', `${p.venueName}, ${p.city}`);

      const popup = new mapboxgl.Popup({
        offset: 22,
        closeButton: true,
        closeOnClick: true,
        maxWidth: '260px',
      }).setHTML(formatPopup(p));

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .setPopup(popup)
        .addTo(map);

      markers.push(marker);
      bounds.extend([p.lng, p.lat]);
    }

    if (parties.length > 0) {
      map.once('load', () => {
        map.fitBounds(bounds, {
          padding: { top: 60, bottom: 60, left: 40, right: 40 },
          maxZoom: 8,
          duration: 0,
        });
      });
    }

    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [parties]);

  if (missingToken) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-600">
        Map unavailable — <code className="bg-white px-1 py-0.5 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> isn&apos;t set.
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[360px] sm:h-[440px] w-full rounded-2xl overflow-hidden border border-neutral-200"
      />
      <style>{`
        .swp-marker {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #00843D;
          border: 3px solid #FFCD00;
          box-shadow: 0 1px 3px rgba(0,0,0,0.35);
          cursor: pointer;
          transition: transform 120ms ease;
        }
        .swp-marker:hover { transform: scale(1.18); }
        .mapboxgl-popup-content {
          padding: 12px 14px !important;
          border-radius: 10px !important;
          box-shadow: 0 6px 24px rgba(0,0,0,0.12) !important;
        }
      `}</style>
    </div>
  );
}
