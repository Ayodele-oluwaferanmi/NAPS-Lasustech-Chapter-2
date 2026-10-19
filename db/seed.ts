import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'site_content.json');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Seed skipped: DATABASE_URL is not configured. Set DATABASE_URL, run db:migrate, then re-run db:seed.');
    process.exit(2);
  }

  const { drizzle } = await import('drizzle-orm/node-postgres');
  const { Pool } = await import('pg');
  const schema = await import('./schema');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const data = JSON.parse(raw);

  await db.insert(schema.siteSettings).values({
    associationName: data.siteSettings?.associationName || 'NAPS LASUSTECH',
    chapterName: data.siteSettings?.chapterName || 'NAPS LASUSTECH',
    shortName: data.siteSettings?.shortName || 'NAPS',
    institution: data.siteSettings?.institution || 'LASUSTECH',
    faculty: data.siteSettings?.faculty || 'Science',
    department: data.siteSettings?.department || 'Physics',
    motto: data.siteSettings?.motto || '',
    academicSession: data.siteSettings?.academicSession || '2025/2026',
    currentSession: data.siteSettings?.currentSession || '2025/2026',
    semester: data.siteSettings?.semester || 'Harmattan',
    duesAmount: String(data.siteSettings?.duesAmount || 2000),
    bankName: data.siteSettings?.bankName || '',
    accountNumber: data.siteSettings?.accountNumber || '',
    accountName: data.siteSettings?.accountName || '',
    portalNotice: data.siteSettings?.portalNotice || '',
    broadcastNotice: data.siteSettings?.broadcastNotice || '',
    emergencyNotice: data.siteSettings?.emergencyNotice || '',
    registrationOpen: data.siteSettings?.registrationOpen ?? true,
    allowRegistration: data.siteSettings?.allowRegistration ?? true,
    allowVoting: data.siteSettings?.allowVoting ?? true,
    maintenanceMode: data.siteSettings?.maintenanceMode ?? false,
    contactEmail: data.siteSettings?.contactEmail || ''
  }).onConflictDoNothing();

  await db.insert(schema.contactInfo).values({
    phone: data.contact?.phone || '',
    alternativePhone: data.contact?.alternativePhone || '',
    email: data.contact?.email || '',
    secretariatEmail: data.contact?.secretariatEmail || '',
    officeAddress: data.contact?.officeAddress || '',
    address: data.contact?.address || '',
    faculty: data.contact?.faculty || '',
    campus: data.contact?.campus || '',
    twitter: data.contact?.twitter || '',
    instagram: data.contact?.instagram || '',
    linkedin: data.contact?.linkedin || '',
    telegram: data.contact?.telegram || '',
    whatsapp: data.contact?.whatsapp || '',
    whatsappGroup: data.contact?.whatsappGroup || '',
    operatingHours: data.contact?.operatingHours || '',
    officeHours: data.contact?.officeHours || ''
  }).onConflictDoNothing();

  for (const event of data.events || []) {
    await (db.insert(schema.events as any).values({
      id: event.id,
      title: event.title,
      date: event.date,
      description: event.description || '',
      image: event.image || '',
      upcoming: Boolean(event.upcoming),
      ongoing: Boolean(event.ongoing),
      contain: Boolean(event.contain),
      eventTag: event.eventTag || 'General',
      time: event.time || '',
      venue: event.venue || '',
      registrationInfo: event.registrationInfo || '',
      registrationUrl: event.registrationUrl || ''
    }) as any).onConflictDoNothing();
  }

  console.log('DB seed scaffolded successfully');
  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
