import 'dotenv/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/lib/db/schema';
import { SOCCEROOS_MATCHES } from '../src/lib/seed/matches';

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error('TURSO_DATABASE_URL not set');

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  console.log(`Seeding ${SOCCEROOS_MATCHES.length} matches…`);
  for (const m of SOCCEROOS_MATCHES) {
    await db
      .insert(schema.matches)
      .values(m)
      .onConflictDoUpdate({
        target: schema.matches.id,
        set: {
          opponent: m.opponent,
          stage: m.stage,
          kickoffUtc: m.kickoffUtc,
          venueCity: m.venueCity,
          venueCountry: m.venueCountry,
          notes: m.notes,
          isTbd: m.isTbd,
        },
      });
  }
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
