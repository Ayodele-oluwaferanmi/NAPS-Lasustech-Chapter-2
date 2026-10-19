import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not configured in .env');
}

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, {
  schema,
});

export function getDb() {
  return db;
}

export async function testDatabaseConnection() {
  const client = await pool.connect();

  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}



// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";
// import * as schema from "./schema.ts";

// let pool: Pool | null = null;
// let dbInstance: ReturnType<typeof drizzle> | null = null;

// export function createPool(): Pool {
//   if (pool) {
//     return pool;
//   }

//   const databaseUrl = process.env.DATABASE_URL;

//   if (!databaseUrl) {
//     throw new Error(
//       "DATABASE_URL is missing. Please add DATABASE_URL to your .env file."
//     );
//   }

//   pool = new Pool({
//     connectionString: databaseUrl,
//     max: 10,
//     connectionTimeoutMillis: 15000,
//     idleTimeoutMillis: 30000,
//   });

//   pool.on("error", (error) => {
//     console.error("Unexpected PostgreSQL pool error:", error);
//   });

//   return pool;
// }

// export function getDb() {
//   if (!dbInstance) {
//     dbInstance = drizzle(createPool(), {
//       schema,
//     });
//   }

//   return dbInstance;
// }

// export function isDatabaseConfigured(): boolean {
//   return Boolean(process.env.DATABASE_URL);
// }

// export async function testDatabaseConnection(): Promise<boolean> {
//   try {
//     const client = await createPool().connect();

//     try {
//       await client.query("SELECT 1");
//       return true;
//     } finally {
//       client.release();
//     }
//   } catch (error) {
//     console.error("PostgreSQL connection failed:", error);
//     return false;
//   }
// }

// export const db = new Proxy(
//   {},
//   {
//     get(_target, property) {
//       return (getDb() as any)[property];
//     },
//   }
// ) as ReturnType<typeof drizzle>;