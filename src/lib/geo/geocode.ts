import 'server-only';

export type GeocodeResult = {
  lat: number;
  lng: number;
  formatted: string;
};

/**
 * Forward-geocode a US street address using Mapbox.
 * Requires MAPBOX_TOKEN. Returns null if no result or token missing.
 *
 * Docs: https://docs.mapbox.com/api/search/geocoding/
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const token = process.env.MAPBOX_TOKEN;
  if (!token) {
    console.warn('MAPBOX_TOKEN not set — skipping geocode');
    return null;
  }
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json` +
    `?country=US&limit=1&access_token=${token}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error('Mapbox geocode failed', res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as {
    features?: Array<{ center: [number, number]; place_name: string }>;
  };
  const f = data.features?.[0];
  if (!f) return null;
  const [lng, lat] = f.center;
  return { lat, lng, formatted: f.place_name };
}
