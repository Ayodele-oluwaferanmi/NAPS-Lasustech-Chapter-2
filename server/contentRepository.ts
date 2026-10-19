import { eq, asc, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema';

export class PostgresContentRepository {
  constructor(private readonly db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }))) {}

  async getAll() {
    return {
      events: await this.db.select().from(schema.events),
      gallery: await this.db.select().from(schema.galleryAlbums),
      constitution: await this.db.select().from(schema.constitutionDocuments),
      awards: await this.db.select().from(schema.awards),
      voting: {
        categories: await this.db.select().from(schema.votingCategories),
        settings: await this.db.select().from(schema.votingSettings).then((rows) => rows[0] || null),
        userVotedCategories: [] as string[]
      },
      contact: await this.db.select().from(schema.contactInfo).then((rows) => rows[0] || null),
      menu: await this.db.select().from(schema.navigationMenuItems).orderBy(asc(schema.navigationMenuItems.order)),
      people: await this.db.select().from(schema.peopleProfiles),
      pastQuestions: await this.db.select().from(schema.pastQuestions),
      siteSettings: await this.db.select().from(schema.siteSettings).then((rows) => rows[0] || null)
    };
  }
}
