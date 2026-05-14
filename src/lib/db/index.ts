import 'server-only';
import { createClient, type Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

let _client: Client | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getClient() {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    throw new Error(
      'TURSO_DATABASE_URL is not set. Add it to .env.local (e.g. libsql://your-db.turso.io) ' +
        'and set TURSO_AUTH_TOKEN.',
    );
  }
  _client = createClient({ url, authToken });
  return _client;
}

/**
 * Lazy Drizzle client. The connection isn't opened until the first query,
 * so module imports during `next build` (env-less) won't fail.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    if (!_db) _db = drizzle(getClient(), { schema });
    // @ts-expect-error proxying through to the real instance
    const value = _db[prop];
    return typeof value === 'function' ? value.bind(_db) : value;
  },
});

export { schema };
