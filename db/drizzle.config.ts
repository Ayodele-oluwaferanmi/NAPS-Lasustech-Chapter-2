import 'dotenv/config';

import {
  defineConfig,
} from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',

  out: './drizzle',

  dialect: 'postgresql',

  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  strict: true,

  verbose: true,
});

// import 'dotenv/config';
// import type { Config } from 'drizzle-kit';

// export default {
//   schema: './db/schema.ts',
//   out: './db/migrations',
//   dialect: 'postgresql',
//   dbCredentials: {
//     url: process.env.DATABASE_URL || 'postgres://postgres:@localhost:5432/naps_lasustech'
//   }
// } satisfies Config;
