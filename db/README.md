# PostgreSQL / Drizzle migration scaffold

This workspace now includes a schema-first PostgreSQL/Drizzle scaffold that mirrors the current Express route contract and the existing content model in the JSON file store.

## Files added

- `db/schema.ts`: normalized Drizzle PostgreSQL schema covering users, sessions, voting, content, media, menu, people, settings, payments and past questions.
- `db/drizzle.config.ts`: Drizzle configuration for PostgreSQL migrations.
- `db/seed.ts`: one-time seed adapter that can import the existing `data/site_content.json` payload into the PostgreSQL tables.
- `server/contentRepository.ts`: repository adapter skeleton that composes the route payload shape from relational tables.
- `server/postgresStore.ts`: base Drizzle/Postgres connection factory scaffold.

## Proposed next migration steps

1. Install `drizzle-orm`, `drizzle-kit`, and `pg` if not already available.
2. Add `DATABASE_URL` in environment configuration for the deployment target.
3. Run `drizzle-kit generate` to create the migration files.
4. Run `drizzle-kit migrate` against PostgreSQL.
5. Run `tsx db/seed.ts` to import the existing file-backed content dataset.

This scaffold intentionally keeps the route contracts in `server/contentRoutes.ts` and `src/utils/contentClient.ts` unchanged while moving persistence behind them.
