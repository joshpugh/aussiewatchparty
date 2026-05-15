/**
 * Seeds a varied set of test watch parties across the US so the UI can be
 * exercised. Idempotent — re-running upserts by slug.
 *
 *   npm run db:seed-parties
 *
 * Also removes the synthetic "Smoke Test Pub" from earlier.
 *
 * The names and addresses are fictitious test fixtures. Replace with real
 * venues from the admin UI before launch.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import * as schema from '../src/lib/db/schema';

// Stable Pantone 348C/116C SVG logo as a data URL, with the venue's initial.
// We embed three colour-swap variants so cards look varied at a glance.
function logoFor(letter: string, variant: 'a' | 'b' | 'c'): string {
  const palettes = {
    a: { bg: '00843D', fg: 'FFCD00' },
    b: { bg: 'FFCD00', fg: '00843D' },
    c: { bg: '0A0A0A', fg: 'FFCD00' },
  };
  const { bg, fg } = palettes[variant];
  return `https://placehold.co/240x240/${bg}/${fg}/png?text=${encodeURIComponent(letter)}&font=oswald`;
}

type TestParty = {
  slug: string;
  matchId: 'aus-group-1' | 'aus-group-2' | 'aus-group-3';
  venueName: string;
  logoLetter: string | null;
  logoVariant: 'a' | 'b' | 'c';
  addressLine: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  hostNotes: string | null;
  capacity: number | null;
  contactEmail: string | null;
  websiteUrl: string | null;
};

const PARTIES: TestParty[] = [
  // NYC — Manhattan
  {
    slug: 'the-bondi-pub-manhattan',
    matchId: 'aus-group-2',
    venueName: 'The Bondi Pub',
    logoLetter: 'B',
    logoVariant: 'a',
    addressLine: '231 Mulberry St',
    city: 'New York',
    state: 'NY',
    zip: '10012',
    lat: 40.722,
    lng: -73.9961,
    hostNotes:
      'Doors open 2 hours before kickoff. Pies and sausage rolls from open. Reserved long tables for groups of 6+ — message ahead.',
    capacity: 140,
    contactEmail: 'hello@bondipub.test',
    websiteUrl: 'https://bondipub.test',
  },
  // Brooklyn
  {
    slug: 'kookaburra-brooklyn',
    matchId: 'aus-group-2',
    venueName: 'Kookaburra',
    logoLetter: 'K',
    logoVariant: 'b',
    addressLine: '425 Bedford Ave',
    city: 'Brooklyn',
    state: 'NY',
    zip: '11249',
    lat: 40.7164,
    lng: -73.9637,
    hostNotes:
      'Backyard with 4 screens. Cash bar, BYO Vegemite for the t-shirt sandwich special.',
    capacity: 80,
    contactEmail: null,
    websiteUrl: null,
  },
  // LA — Venice
  {
    slug: 'outback-sports-venice',
    matchId: 'aus-group-1',
    venueName: 'Outback Sports Bar',
    logoLetter: 'O',
    logoVariant: 'c',
    addressLine: '12 Windward Ave',
    city: 'Venice',
    state: 'CA',
    zip: '90291',
    lat: 33.9882,
    lng: -118.4744,
    hostNotes: 'Sunday breakfast service for the Vancouver match. Coffee + Aussie brekkie from 6am.',
    capacity: 60,
    contactEmail: 'venice@outbacksports.test',
    websiteUrl: 'https://outbacksports.test/venice',
  },
  // LA — Hollywood
  {
    slug: 'the-wallaby-hollywood',
    matchId: 'aus-group-3',
    venueName: 'The Wallaby',
    logoLetter: 'W',
    logoVariant: 'a',
    addressLine: '6776 Hollywood Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90028',
    lat: 34.1022,
    lng: -118.3409,
    hostNotes: null,
    capacity: 100,
    contactEmail: null,
    websiteUrl: 'https://thewallaby.test',
  },
  // SF
  {
    slug: 'sydney-sports-house-soma',
    matchId: 'aus-group-3',
    venueName: 'Sydney Sports House',
    logoLetter: 'S',
    logoVariant: 'b',
    addressLine: '170 King St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
    lat: 37.7762,
    lng: -122.3897,
    hostNotes:
      'Within walking distance of public transit to Levi’s Stadium for anyone heading down for the match itself.',
    capacity: 200,
    contactEmail: 'parties@sydneysports.test',
    websiteUrl: null,
  },
  // San Diego
  {
    slug: 'coopers-corner-pacific-beach',
    matchId: 'aus-group-1',
    venueName: "Cooper's Corner",
    logoLetter: 'C',
    logoVariant: 'c',
    addressLine: '4150 Mission Blvd',
    city: 'San Diego',
    state: 'CA',
    zip: '92109',
    lat: 32.7945,
    lng: -117.2547,
    hostNotes: null,
    capacity: 50,
    contactEmail: null,
    websiteUrl: null,
  },
  // Seattle (close to the USA match)
  {
    slug: 'the-roos-nest-capitol-hill',
    matchId: 'aus-group-2',
    venueName: "The Roo's Nest",
    logoLetter: 'R',
    logoVariant: 'a',
    addressLine: '928 12th Ave',
    city: 'Seattle',
    state: 'WA',
    zip: '98122',
    lat: 47.6128,
    lng: -122.3173,
    hostNotes:
      'Shuttle bus to Lumen Field for the AUS vs USA match — sign up at the door an hour before.',
    capacity: 220,
    contactEmail: 'events@roosnest.test',
    websiteUrl: 'https://roosnest.test',
  },
  // Boston
  {
    slug: 'the-boomerang-fenway',
    matchId: 'aus-group-2',
    venueName: 'The Boomerang',
    logoLetter: 'B',
    logoVariant: 'b',
    addressLine: '110 Brookline Ave',
    city: 'Boston',
    state: 'MA',
    zip: '02215',
    lat: 42.3454,
    lng: -71.0996,
    hostNotes: null,
    capacity: null,
    contactEmail: null,
    websiteUrl: null,
  },
  // Chicago
  {
    slug: 'down-under-bar-wicker-park',
    matchId: 'aus-group-3',
    venueName: 'Down Under Bar',
    logoLetter: 'D',
    logoVariant: 'c',
    addressLine: '1573 N Milwaukee Ave',
    city: 'Chicago',
    state: 'IL',
    zip: '60622',
    lat: 41.9099,
    lng: -87.6772,
    hostNotes:
      'Free entry, ticketed for entry capacity. Aussie meat pies all weekend; supply is limited.',
    capacity: 180,
    contactEmail: null,
    websiteUrl: null,
  },
  // Denver
  {
    slug: 'vegemite-tavern-lodo',
    matchId: 'aus-group-1',
    venueName: 'Vegemite Tavern',
    logoLetter: 'V',
    logoVariant: 'a',
    addressLine: '1735 19th St',
    city: 'Denver',
    state: 'CO',
    zip: '80202',
    lat: 39.7556,
    lng: -105.0009,
    hostNotes: null,
    capacity: 75,
    contactEmail: 'hi@vegemitetavern.test',
    websiteUrl: 'https://vegemitetavern.test',
  },
  // Austin
  {
    slug: 'crikey-tavern-rainey-street',
    matchId: 'aus-group-2',
    venueName: 'Crikey Tavern',
    logoLetter: 'C',
    logoVariant: 'b',
    addressLine: '78 Rainey St',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    lat: 30.2587,
    lng: -97.7396,
    hostNotes:
      'Live commentary on the patio with the SBS feed when available. Texas BBQ + lamingtons combo platter (don’t ask).',
    capacity: 120,
    contactEmail: null,
    websiteUrl: null,
  },
  // Miami
  {
    slug: 'the-drongo-wynwood',
    matchId: 'aus-group-1',
    venueName: 'The Drongo',
    logoLetter: 'D',
    logoVariant: 'b',
    addressLine: '2240 NW 2nd Ave',
    city: 'Miami',
    state: 'FL',
    zip: '33127',
    lat: 25.7986,
    lng: -80.1989,
    hostNotes: null,
    capacity: 90,
    contactEmail: null,
    websiteUrl: null,
  },
  // Washington DC
  {
    slug: 'the-aussie-anchor-dupont',
    matchId: 'aus-group-3',
    venueName: 'The Aussie Anchor',
    logoLetter: 'A',
    logoVariant: 'c',
    addressLine: '1612 17th St NW',
    city: 'Washington',
    state: 'DC',
    zip: '20009',
    lat: 38.9128,
    lng: -77.0379,
    hostNotes:
      'Watch in the cellar — capacity is tight, RSVP strongly encouraged.',
    capacity: 40,
    contactEmail: 'rsvp@aussieanchor.test',
    websiteUrl: null,
  },
  // Atlanta
  {
    slug: 'surfside-sports-old-fourth-ward',
    matchId: 'aus-group-2',
    venueName: 'Surfside Sports',
    logoLetter: 'S',
    logoVariant: 'a',
    addressLine: '675 Highland Ave NE',
    city: 'Atlanta',
    state: 'GA',
    zip: '30312',
    lat: 33.7693,
    lng: -84.367,
    hostNotes: null,
    capacity: 110,
    contactEmail: null,
    websiteUrl: 'https://surfsidesports.test',
  },
  // Phoenix
  {
    slug: 'sandgropers-tempe',
    matchId: 'aus-group-1',
    venueName: 'Sandgropers',
    logoLetter: 'S',
    logoVariant: 'c',
    addressLine: '420 S Mill Ave',
    city: 'Tempe',
    state: 'AZ',
    zip: '85281',
    lat: 33.4225,
    lng: -111.9405,
    hostNotes: null,
    capacity: 65,
    contactEmail: null,
    websiteUrl: null,
  },
];

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error('TURSO_DATABASE_URL not set');
  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  // 1. Wipe the synthetic smoke-test pub if it's still around.
  const removed = await db
    .delete(schema.parties)
    .where(eq(schema.parties.slug, 'smoke-test-pub-newark'))
    .returning({ id: schema.parties.id });
  if (removed.length > 0) console.log('Removed Smoke Test Pub.');

  // 2. Upsert each test party.
  let inserted = 0;
  let updated = 0;
  for (const p of PARTIES) {
    const existing = await db
      .select({ id: schema.parties.id })
      .from(schema.parties)
      .where(eq(schema.parties.slug, p.slug))
      .limit(1);

    const venueLogoUrl = p.logoLetter
      ? logoFor(p.logoLetter, p.logoVariant)
      : null;

    if (existing.length === 0) {
      await db.insert(schema.parties).values({
        id: randomBytes(8).toString('base64url'),
        slug: p.slug,
        matchId: p.matchId,
        venueName: p.venueName,
        venueLogoUrl,
        addressLine: p.addressLine,
        city: p.city,
        state: p.state,
        zip: p.zip,
        lat: p.lat,
        lng: p.lng,
        hostNotes: p.hostNotes,
        capacity: p.capacity,
        contactEmail: p.contactEmail,
        websiteUrl: p.websiteUrl,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      inserted++;
    } else {
      await db
        .update(schema.parties)
        .set({
          matchId: p.matchId,
          venueName: p.venueName,
          venueLogoUrl,
          addressLine: p.addressLine,
          city: p.city,
          state: p.state,
          zip: p.zip,
          lat: p.lat,
          lng: p.lng,
          hostNotes: p.hostNotes,
          capacity: p.capacity,
          contactEmail: p.contactEmail,
          websiteUrl: p.websiteUrl,
          updatedAt: new Date(),
        })
        .where(eq(schema.parties.id, existing[0].id));
      updated++;
    }
  }

  console.log(`Inserted ${inserted}, updated ${updated}. Total: ${PARTIES.length}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
