import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb
} from 'drizzle-orm/pg-core';

// --- Auth ---

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  matricNumber: text('matric_number').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password'),
  whatsappNumber: text('whatsapp_number'),
  phoneNumber: text('phone_number'),
  level: text('level').notNull(),
  discipline: text('discipline').notNull(),
  gender: text('gender'),
  birthday: text('birthday'),
  post: text('post'),
  duesStatus: text('dues_status').notNull().default('Pending'),
  idCardStatus: text('id_card_status'),
  attendance: integer('attendance').default(0),
  resources: integer('resources').default(0),
  profileImage: text('profile_image'),
  role: text('role').notNull().default('student'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isAccountActive: boolean('is_account_active').default(true),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  lastLoginAt: timestamp('last_login_at')
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(), // Using the token as ID
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const passwordResets = pgTable('password_resets', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// --- Content ---

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  description: text('description').notNull(),
  image: text('image').notNull(),
  upcoming: boolean('upcoming').default(false),
  ongoing: boolean('ongoing').default(false),
  contain: boolean('contain').default(false),
  eventTag: text('event_tag'),
  time: text('time'),
  venue: text('venue'),
  registrationInfo: text('registration_info'),
  registrationUrl: text('registration_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const galleryAlbums = pgTable('gallery_albums', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  eventTag: text('event_tag').notNull(),
  date: text('date').notNull(),
  dateSortValue: text('date_sort_value'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const galleryImages = pgTable('gallery_images', {
  id: serial('id').primaryKey(),
  albumId: text('album_id').notNull().references(() => galleryAlbums.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  order: integer('order').notNull().default(0)
});

export const constitutionDocument = pgTable('constitution_document', {
  id: integer('id').primaryKey().default(1),
  pdfUrl: text('pdf_url').default(''),
  fileName: text('file_name').default(''),
  fileSize: text('file_size').default(''),
  updatedAt: text('updated_at').default(''),
  published: boolean('published').default(false)
});

export const constitutionArticles = pgTable('constitution_articles', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => constitutionDocument.id, { onDelete: 'cascade' }),
  number: text('number').notNull(),
  title: text('title').notNull(),
  order: integer('order').notNull().default(0)
});

export const constitutionSections = pgTable('constitution_sections', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').notNull().references(() => constitutionArticles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  order: integer('order').notNull().default(0)
});

export const awards = pgTable('awards', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  recipient: text('recipient').notNull(),
  year: text('year').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  image: text('image'),
  certificateUrl: text('certificate_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const votingSettings = pgTable('voting_settings', {
  id: integer('id').primaryKey().default(1),
  isOpen: boolean('is_open').default(false).notNull(),
  title: text('title'),
  electionTitle: text('election_title'),
  session: text('session'),
  instructions: text('instructions'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  allowMultipleCategoriesVote: boolean('allow_multiple_categories_vote').default(false),
  oneVotePerUser: boolean('one_vote_per_user').default(true),
  requireBiometrics: boolean('require_biometrics').default(false),
  strictMatricValidation: boolean('strict_matric_validation').default(true)
});

export const votingCategories = pgTable('voting_categories', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  groupKey: text('group_key').notNull(),
  groupName: text('group_name').notNull(),
  description: text('description').notNull(),
  order: integer('order').notNull().default(0)
});

export const votingNominees = pgTable('voting_nominees', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull().references(() => votingCategories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  level: text('level').notNull(),
  discipline: text('discipline').notNull(),
  image: text('image'),
  description: text('description')
});

export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').notNull().references(() => votingCategories.id, { onDelete: 'cascade' }),
  nomineeId: text('nominee_id').notNull().references(() => votingNominees.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const contactInfo = pgTable('contact_info', {
  id: integer('id').primaryKey().default(1),
  phone: text('phone').notNull(),
  alternativePhone: text('alternative_phone'),
  email: text('email').notNull(),
  secretariatEmail: text('secretariat_email'),
  officeAddress: text('office_address'),
  address: text('address'),
  faculty: text('faculty'),
  campus: text('campus'),
  twitter: text('twitter'),
  instagram: text('instagram'),
  linkedin: text('linkedin'),
  telegram: text('telegram'),
  whatsapp: text('whatsapp'),
  whatsappGroup: text('whatsapp_group'),
  operatingHours: text('operating_hours'),
  officeHours: text('office_hours')
});

export const navigationMenu = pgTable('navigation_menu', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  targetView: text('target_view').notNull(),
  visible: boolean('visible').default(true).notNull(),
  order: integer('order').notNull().default(0),
  isExternal: boolean('is_external').default(false),
  externalUrl: text('external_url'),
  badge: text('badge')
});

export const peopleProfiles = pgTable('people_profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  post: text('post').notNull(),
  level: text('level').notNull(),
  description: text('description').notNull(),
  bio: text('bio'),
  image: text('image').notNull(),
  category: text('category').notNull(), // 'executive' | 'honourable' | 'patron' | 'hoc' | 'official'
  phone: text('phone'),
  email: text('email'),
  department: text('department'),
  order: integer('order').notNull().default(0)
});

export const pastQuestions = pgTable('past_questions', {
  id: text('id').primaryKey(),
  courseCode: text('course_code').notNull(),
  courseTitle: text('course_title').notNull(),
  level: text('level').notNull(),
  semester: text('semester').notNull(),
  session: text('session').notNull(),
  examType: text('exam_type').notNull(),
  downloads: integer('downloads').default(0).notNull(),
  fileSize: text('file_size').notNull(),
  formatType: text('format_type'),
  department: text('department'),
  instructions: text('instructions'),
  duration: text('duration'),
  pdfUrl: text('pdf_url'),
  pdfFileName: text('pdf_file_name'),
  manualContent: text('manual_content'),
  uploadedAt: text('uploaded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const pastQuestionImages = pgTable('past_question_images', {
  id: serial('id').primaryKey(),
  pastQuestionId: text('past_question_id').notNull().references(() => pastQuestions.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  order: integer('order').notNull().default(0)
});

export const pastQuestionManuals = pgTable('past_question_manuals', {
  id: text('id').primaryKey(),
  pastQuestionId: text('past_question_id').notNull().references(() => pastQuestions.id, { onDelete: 'cascade' }),
  number: text('number').notNull(),
  section: text('section'),
  text: text('text').notNull(),
  options: jsonb('options').$type<string[]>(), // json array
  answer: text('answer'),
  marks: text('marks'),
  order: integer('order').notNull().default(0)
});

export const siteSettings = pgTable('site_settings', {
  id: integer('id').primaryKey().default(1),
  associationName: text('association_name').notNull().default('National Association of Physics Students'),
  chapterName: text('chapter_name'),
  shortName: text('short_name'),
  institution: text('institution'),
  faculty: text('faculty'),
  department: text('department'),
  motto: text('motto'),
  academicSession: text('academic_session'),
  currentSession: text('current_session'),
  semester: text('semester'),
  duesAmount: integer('dues_amount').notNull().default(0),
  bankName: text('bank_name'),
  accountNumber: text('account_number'),
  accountName: text('account_name'),
  portalNotice: text('portal_notice'),
  broadcastNotice: text('broadcast_notice'),
  emergencyNotice: text('emergency_notice'),
  registrationOpen: boolean('registration_open').default(true),
  allowRegistration: boolean('allow_registration').default(true),
  allowVoting: boolean('allow_voting').default(false),
  maintenanceMode: boolean('maintenance_mode').default(false),
  contactEmail: text('contact_email')
});

// Relations for easier fetching (Drizzle Orm relations)
export const galleryAlbumsRelations = relations(galleryAlbums, ({ many }) => ({
  images: many(galleryImages),
}));

export const galleryImagesRelations = relations(galleryImages, ({ one }) => ({
  album: one(galleryAlbums, {
    fields: [galleryImages.albumId],
    references: [galleryAlbums.id],
  }),
}));

export const constitutionDocumentRelations = relations(constitutionDocument, ({ many }) => ({
  articles: many(constitutionArticles),
}));

export const constitutionArticlesRelations = relations(constitutionArticles, ({ one, many }) => ({
  document: one(constitutionDocument, {
    fields: [constitutionArticles.documentId],
    references: [constitutionDocument.id],
  }),
  sections: many(constitutionSections),
}));

export const constitutionSectionsRelations = relations(constitutionSections, ({ one }) => ({
  article: one(constitutionArticles, {
    fields: [constitutionSections.articleId],
    references: [constitutionArticles.id],
  }),
}));

export const votingCategoriesRelations = relations(votingCategories, ({ many }) => ({
  nominees: many(votingNominees),
}));

export const votingNomineesRelations = relations(votingNominees, ({ one, many }) => ({
  category: one(votingCategories, {
    fields: [votingNominees.categoryId],
    references: [votingCategories.id],
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  nominee: one(votingNominees, {
    fields: [votes.nomineeId],
    references: [votingNominees.id],
  }),
  category: one(votingCategories, {
    fields: [votes.categoryId],
    references: [votingCategories.id],
  }),
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
}));

export const pastQuestionsRelations = relations(pastQuestions, ({ many }) => ({
  images: many(pastQuestionImages),
  manualQuestions: many(pastQuestionManuals),
}));

export const pastQuestionImagesRelations = relations(pastQuestionImages, ({ one }) => ({
  pastQuestion: one(pastQuestions, {
    fields: [pastQuestionImages.pastQuestionId],
    references: [pastQuestions.id],
  }),
}));

export const pastQuestionManualsRelations = relations(pastQuestionManuals, ({ one }) => ({
  pastQuestion: one(pastQuestions, {
    fields: [pastQuestionManuals.pastQuestionId],
    references: [pastQuestions.id],
  }),
}));
