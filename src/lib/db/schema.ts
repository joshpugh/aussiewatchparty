import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

/**
 * Matches — Socceroos fixtures for the 2026 men's tournament.
 * Seeded from src/lib/seed/matches.ts; admins can also edit via SQL.
 */
export const matches = sqliteTable('matches', {
  id: text('id').primaryKey(), // human-readable slug e.g. "aus-vs-tbd-1"
  opponent: text('opponent').notNull(), // e.g. "TBD" or "France"
  stage: text('stage').notNull(), // group | r16 | qf | sf | f
  kickoffUtc: integer('kickoff_utc', { mode: 'timestamp' }).notNull(),
  venueCity: text('venue_city'), // e.g. "Vancouver"
  venueCountry: text('venue_country'),
  notes: text('notes'),
  isTbd: integer('is_tbd', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

/**
 * Parties — venues hosting a Socceroos watch party.
 * Admin-curated. Geocoded on save so we can sort by distance from a ZIP.
 */
export const parties = sqliteTable(
  'parties',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    matchId: text('match_id').notNull().references(() => matches.id, { onDelete: 'cascade' }),
    venueName: text('venue_name').notNull(),
    venueLogoUrl: text('venue_logo_url'),
    addressLine: text('address_line').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(), // 2-letter US state code
    zip: text('zip').notNull(),
    lat: real('lat').notNull(),
    lng: real('lng').notNull(),
    hostNotes: text('host_notes'), // free text, e.g. "Bookings open at 6pm, food specials"
    capacity: integer('capacity'), // optional
    contactEmail: text('contact_email'),
    websiteUrl: text('website_url'),
    isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (t) => ({
    slugIdx: uniqueIndex('parties_slug_idx').on(t.slug),
    matchIdx: index('parties_match_idx').on(t.matchId),
    stateIdx: index('parties_state_idx').on(t.state),
  }),
);

/**
 * RSVPs — name + email + party size + consent.
 * One row per signup. (name, email) is not enforced unique — same person
 * can RSVP to multiple parties / multiple matches.
 */
export const rsvps = sqliteTable(
  'rsvps',
  {
    id: text('id').primaryKey(),
    partyId: text('party_id').notNull().references(() => parties.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    partySize: integer('party_size').notNull().default(1),
    consent: integer('consent', { mode: 'boolean' }).notNull(),
    confirmationSentAt: integer('confirmation_sent_at', { mode: 'timestamp' }),
    reminderSentAt: integer('reminder_sent_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (t) => ({
    partyIdx: index('rsvps_party_idx').on(t.partyId),
    emailIdx: index('rsvps_email_idx').on(t.email),
  }),
);

/**
 * Admin sessions — opaque session tokens stored server-side, mapped to
 * a single boot-time admin identity. We keep these in the DB rather than
 * a JWT so we can revoke from the dashboard if needed later.
 */
export const adminSessions = sqliteTable('admin_sessions', {
  id: text('id').primaryKey(), // random 32-byte token, base64url
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

/**
 * ZIP centroids — populated once from a public US ZIP dataset.
 * Used to convert a visitor's ZIP into a (lat, lng) for distance sort.
 */
export const zipCentroids = sqliteTable('zip_centroids', {
  zip: text('zip').primaryKey(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  city: text('city'),
  state: text('state'),
});

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type Party = typeof parties.$inferSelect;
export type NewParty = typeof parties.$inferInsert;
export type Rsvp = typeof rsvps.$inferSelect;
export type NewRsvp = typeof rsvps.$inferInsert;
