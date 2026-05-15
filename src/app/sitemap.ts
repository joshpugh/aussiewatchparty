import type { MetadataRoute } from 'next';
import { listPublishedParties } from '@/lib/parties';
import { listMatches } from '@/lib/matches';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aussiewatchparty.com';

export const revalidate = 3600; // regenerate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [matches, parties] = await Promise.all([
    listMatches(),
    listPublishedParties(),
  ]);
  const now = new Date();
  return [
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE}/submit`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...matches.map((m) => ({
      url: `${BASE}/match/${m.id}`,
      lastModified: m.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...parties.map((p) => ({
      url: `${BASE}/parties/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
