import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

// Drizzle CLI runs outside Next.js, so we load .env.local manually.
// Next.js takes care of this for app code on its own.
config({ path: '.env.local' });
config(); // also load .env if present

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
