'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Baked into the build at compile time — read once.
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export type MapParty = {
  slug: string;
  venueName: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  matchOpponent: string;
};

export type MapOrigin = {
  lat: number;
  lng: number;
  label?: string;
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
        View watch party →
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

/** A 64-point polygon approximating a circle of `radiusMi` around `center`. */
function radiusCircle(
  center: { lat: number; lng: number },
  radiusMi: number,
  points = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const radiusKm = radiusMi * 1.60934;
  const earthKm = 6371;
  const latRad = (center.lat * Math.PI) / 180;
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * 2 * Math.PI;
    const dy = (radiusKm / earthKm) * Math.sin(t);
    const dx = (radiusKm / earthKm) * Math.cos(t);
    const lng = center.lng + (dx / Math.cos(latRad)) * (180 / Math.PI);
    const lat = center.lat + dy * (180 / Math.PI);
    coords.push([lng, lat]);
  }
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  };
}

export function PartiesMap({
  parties,
  origin,
  radiusMi = 75,
}: {
  parties: MapParty[];
  origin?: MapOrigin;
  radiusMi?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      // Initial centre — overridden by fitBounds below.
      center: origin ? [origin.lng, origin.lat] : [-95.7129, 37.0902],
      zoom: origin ? 8 : 3.4,
      attributionControl: true,
      cooperativeGestures: true,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    const markers: mapboxgl.Marker[] = [];

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
    }

    // Origin marker (distinct gold pin so visitors recognise "this is where
    // they searched from").
    if (origin) {
      const oEl = document.createElement('div');
      oEl.className = 'swp-marker-origin';
      oEl.setAttribute('aria-label', origin.label ?? 'Your location');
      if (origin.label) {
        const popup = new mapboxgl.Popup({ offset: 18, closeButton: false }).setHTML(
          `<div style="font-family: var(--font-sans), sans-serif; font-size: 12px; padding: 2px 4px"><strong>${escapeHtml(origin.label)}</strong></div>`,
        );
        new mapboxgl.Marker({ element: oEl })
          .setLngLat([origin.lng, origin.lat])
          .setPopup(popup)
          .addTo(map);
      } else {
        new mapboxgl.Marker({ element: oEl }).setLngLat([origin.lng, origin.lat]).addTo(map);
      }
    }

    map.once('load', () => {
      // Draw the search radius and zoom to it when there's an origin.
      if (origin) {
        const circle = radiusCircle(origin, radiusMi);
        map.addSource('search-radius', { type: 'geojson', data: circle });
        map.addLayer({
          id: 'search-radius-fill',
          type: 'fill',
          source: 'search-radius',
          paint: { 'fill-color': '#00843D', 'fill-opacity': 0.07 },
        });
        map.addLayer({
          id: 'search-radius-line',
          type: 'line',
          source: 'search-radius',
          paint: {
            'line-color': '#00843D',
            'line-width': 2,
            'line-dasharray': [2, 2],
            'line-opacity': 0.7,
          },
        });

        // Fit bounds to the circle (with a little padding so the line isn't
        // flush against the edge of the canvas).
        const ring = circle.geometry.coordinates[0];
        const bounds = ring.reduce(
          (b, c) => b.extend(c as [number, number]),
          new mapboxgl.LngLatBounds(),
        );
        map.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 30, right: 30 },
          maxZoom: 10,
          duration: 0,
        });
      } else if (parties.length > 0) {
        const bounds = parties.reduce(
          (b, p) => b.extend([p.lng, p.lat]),
          new mapboxgl.LngLatBounds(),
        );
        map.fitBounds(bounds, {
          padding: { top: 60, bottom: 60, left: 40, right: 40 },
          maxZoom: 8,
          duration: 0,
        });
      }
    });

    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
    // We track the primitive fields rather than the `origin` object so a
    // fresh-but-equal object on re-render doesn't tear down the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parties, origin?.lat, origin?.lng, origin?.label, radiusMi]);

  if (!MAPBOX_TOKEN) {
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
        .swp-marker-origin {
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: #FFCD00;
          border: 4px solid #00843D;
          box-shadow: 0 1px 3px rgba(0,0,0,0.45), 0 0 0 6px rgba(255,205,0,0.22);
          cursor: pointer;
        }
        .mapboxgl-popup-content {
          padding: 12px 14px !important;
          border-radius: 10px !important;
          box-shadow: 0 6px 24px rgba(0,0,0,0.12) !important;
        }
      `}</style>
    </div>
  );
}
