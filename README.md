# Aussie Watch Party

Unofficial site that lists US watch parties for the Socceroos at the 2026 men's
tournament, and lets fans RSVP. Built to celebrate Australia making the cup.

Live at **aussiewatchparty.com**. Source repo: `joshpugh/aussiewatchparty`.

> **Trademark note:** this site avoids saying "FIFA" / "FIFA World Cup" on-page.
> We say "the tournament" / "the matches". Keep that posture if you edit copy.

## Stack

- **Framework** — Next.js 16 (App Router, TypeScript, Tailwind 4)
- **Database** — Turso (libsql) via Drizzle ORM
- **Email** — Resend (confirmation + 24h-before reminder)
- **Storage** — Vercel Blob (venue logos)
- **Geocoding** — Mapbox forward geocoding (admin-side, address → lat/lng)
- **Cron** — Vercel Cron (`/api/cron/reminders`, hourly)
- **Hosting** — Vercel

## Brand

- Green — `#00843D` (Pantone 348C)
- Gold — `#FFCD00` (Pantone 116C)
- Display font — Archivo Black
- Body font — Inter

## Local development

```bash
# 1. Install deps
npm install

# 2. Set env vars (see .env.example for every key)
cp .env.example .env.local

# 3. Push schema to your Turso DB
npm run db:push

# 4. Seed match fixtures (placeholders — edit src/lib/seed/matches.ts)
npm run db:seed

# 5. Import US ZIP centroids (one-time, ~3 MB download)
npm run db:seed-zips

# 6. Run dev server
npm run dev
```

Open <http://localhost:3000>. The admin lives at `/admin/login` — sign in with
`ADMIN_PASSWORD`.

## External setup (production)

You'll create accounts and tokens in four places. Walk through them in order.

### 1. Turso (database)

```bash
# Install + log in (once)
turso auth login

# Create the prod DB
turso db create socceroos-watch-parties

# Grab the URL + a token
turso db show socceroos-watch-parties --url
turso db tokens create socceroos-watch-parties
```

Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` from those.

### 2. Resend (email)

1. Sign up at <https://resend.com>.
2. Add and verify your sending domain (DNS DKIM + SPF records).
3. Create an API key under **API Keys**.
4. Set `RESEND_API_KEY` and `RESEND_FROM="Socceroos Watch Parties <hello@your-domain.com>"`.

### 3. Vercel (hosting + Blob)

```bash
vercel login
vercel link
```

In the Vercel dashboard for the project:

- **Storage → Create → Blob** → name it something like `swp-logos` → connect.
  This adds `BLOB_READ_WRITE_TOKEN` automatically.
- **Settings → Environment Variables** → add everything else from
  `.env.example`. Pull them locally with `vercel env pull .env.local`.

### 4. Mapbox (geocoding)

1. Sign up at <https://account.mapbox.com>.
2. Create a public token with the **Geocoding** scope.
3. Set `MAPBOX_TOKEN`.

### Cron

`vercel.json` declares an hourly cron at `/api/cron/reminders`. Set
`CRON_SECRET` (any random string) and Vercel will sign requests with
`Authorization: Bearer <secret>`. If unset, the endpoint accepts any caller.

## Editing fixtures

`src/lib/seed/matches.ts` is the source of truth for the Socceroos schedule.
Each entry has a stable `id` (slug) — never change it once parties reference
it. After editing, run `npm run db:seed` to upsert.

## Day-to-day admin

- `/admin/parties` — add / edit / hide venues. Logo uploads go to Blob.
- `/admin/rsvps` — view + export CSV.
- Geocoding runs server-side on save. If Mapbox can't find an address you can
  paste lat/lng explicitly in the form.

## Architecture notes

- **Sessions** are server-side opaque tokens in `admin_sessions` (DB), set as
  an `HttpOnly` cookie. 14-day TTL. `requireAdmin()` guards each protected
  page; the `/admin/login` page does not call it.
- **DB client** is a lazy `Proxy` so `next build` doesn't need env vars.
- **ZIP search** uses Haversine against the public `zip_centroids` table
  seeded from GeoNames.
- **Email is best-effort** on RSVP — if Resend is misconfigured the RSVP
  still succeeds and a log line is written.

## License

MIT. Unofficial fan project. Not affiliated with Football Australia or any governing body.
