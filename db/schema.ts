import { pgTable, text, boolean, timestamp, integer, jsonb, varchar, serial, bigint, decimal } from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 32 }).notNull().unique(),
  description: text('description')
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  matricNumber: text('matric_number').notNull().unique(),
  email: text('email').notNull().unique(),
  phoneNumber: text('phone_number'),
  whatsappNumber: text('whatsapp_number'),
  level: text('level').notNull(),
  discipline: text('discipline').notNull(),
  role: text('role').notNull().default('student'),
  post: text('post'),
  duesStatus: text('dues_status').notNull().default('Pending'),
  idCardStatus: text('id_card_status').notNull().default('Not Registered'),
  attendance: integer('attendance').notNull().default(0),
  resources: integer('resources').notNull().default(0),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  isAccountActive: boolean('is_account_active').notNull().default(true)
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  token: text('token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ip: text('ip'),
  userAgent: text('user_agent')
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: text('id').primaryKey(),
  hashedToken: text('hashed_token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  used: boolean('used').notNull().default(false)
});

export const rateLimitAttempts = pgTable('rate_limit_attempts', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  attempts: integer('attempts').notNull().default(0),
  firstAttemptTime: bigint('first_attempt_time', { mode: 'number' }).notNull(),
  lockedUntil: bigint('locked_until', { mode: 'number' })
});

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  description: text('description').notNull().default(''),
  image: text('image').notNull().default(''),
  upcoming: boolean('upcoming').notNull().default(false),
  ongoing: boolean('ongoing').notNull().default(false),
  contain: boolean('contain').notNull().default(false),
  eventTag: text('event_tag').notNull().default('General'),
  time: text('time'),
  venue: text('venue'),
  registrationInfo: text('registration_info'),
  registrationUrl: text('registration_url')
});

export const galleryAlbums = pgTable('gallery_albums', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  eventTag: text('event_tag').notNull().default('General'),
  date: text('date').notNull(),
  dateSortValue: text('date_sort_value')
});

export const galleryImages = pgTable('gallery_images', {
  id: text('id').primaryKey(),
  albumId: text('album_id').notNull().references(() => galleryAlbums.id),
  imageUrl: text('image_url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const constitutionDocuments = pgTable('constitution_documents', {
  id: text('id').primaryKey(),
  pdfUrl: text('pdf_url'),
  fileName: text('file_name'),
  fileSize: text('file_size'),
  updatedAt: text('updated_at').notNull().default(''),
  published: boolean('published').notNull().default(true),
  articles: jsonb('articles').$type<{ number: string; title: string; sections: { title: string; content: string }[] }[]>()
});

export const constitutionArticles = pgTable('constitution_articles', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => constitutionDocuments.id),
  number: text('number').notNull(),
  title: text('title').notNull()
});

export const constitutionSections = pgTable('constitution_sections', {
  id: text('id').primaryKey(),
  articleId: text('article_id').notNull().references(() => constitutionArticles.id),
  title: text('title').notNull(),
  content: text('content').notNull()
});

export const awards = pgTable('awards', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  recipient: text('recipient').notNull(),
  year: text('year').notNull().default('2025/2026'),
  category: text('category').notNull().default('Excellence'),
  description: text('description').notNull().default(''),
  image: text('image'),
  certificateUrl: text('certificate_url')
});

export const votingCategories = pgTable('voting_categories', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  groupKey: text('group_key').notNull(),
  groupName: text('group_name').notNull(),
  description: text('description').notNull().default('')
});

export const votingNominees = pgTable('voting_nominees', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull().references(() => votingCategories.id),
  name: text('name').notNull(),
  level: text('level').notNull(),
  discipline: text('discipline').notNull(),
  image: text('image'),
  votes: integer('votes').notNull().default(0),
  description: text('description')
});

export const votingSettings = pgTable('voting_settings', {
  id: serial('id').primaryKey(),
  isOpen: boolean('is_open').notNull().default(false),
  title: text('title'),
  electionTitle: text('election_title'),
  session: text('session'),
  instructions: text('instructions'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  allowMultipleCategoriesVote: boolean('allow_multiple_categories_vote').notNull().default(false),
  oneVotePerUser: boolean('one_vote_per_user').notNull().default(true),
  requireBiometrics: boolean('require_biometrics').notNull().default(false),
  strictMatricValidation: boolean('strict_matric_validation').notNull().default(false)
});

export const votes = pgTable('votes', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull().references(() => votingCategories.id),
  nomineeId: text('nominee_id').notNull().references(() => votingNominees.id),
  userId: text('user_id').notNull().references(() => users.id),
  voteCount: integer('vote_count').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const contactInfo = pgTable('contact_info', {
  id: serial('id').primaryKey(),
  phone: text('phone').notNull().default(''),
  alternativePhone: text('alternative_phone'),
  email: text('email').notNull().default(''),
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

export const navigationMenuItems = pgTable('navigation_menu_items', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  targetView: text('target_view').notNull(),
  visible: boolean('visible').notNull().default(true),
  order: integer('order').notNull().default(0),
  isExternal: boolean('is_external').notNull().default(false),
  externalUrl: text('external_url'),
  badge: text('badge'),
  parentId: text('parent_id')
});

export const peopleProfiles = pgTable('people_profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  post: text('post').notNull(),
  level: text('level').notNull(),
  description: text('description').notNull().default(''),
  bio: text('bio'),
  image: text('image').notNull().default(''),
  category: text('category').notNull().default('executive'),
  phone: text('phone'),
  email: text('email'),
  department: text('department'),
  order: integer('order')
});

export const pastQuestions = pgTable('past_questions', {
  id: text('id').primaryKey(),
  courseCode: text('course_code').notNull(),
  courseTitle: text('course_title').notNull(),
  level: text('level').notNull(),
  semester: text('semester').notNull().default('Harmattan'),
  session: text('session').notNull(),
  examType: text('exam_type').notNull().default('Examination'),
  downloads: integer('downloads').notNull().default(0),
  fileSize: text('file_size').notNull().default(''),
  formatType: text('format_type'),
  department: text('department'),
  instructions: text('instructions'),
  duration: text('duration'),
  pdfUrl: text('pdf_url'),
  pdfFileName: text('pdf_file_name'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow()
});

export const pastQuestionImages = pgTable('past_question_images', {
  id: text('id').primaryKey(),
  pastQuestionId: text('past_question_id').notNull().references(() => pastQuestions.id),
  imageUrl: text('image_url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const pastQuestionManualQuestions = pgTable('past_question_manual_questions', {
  id: text('id').primaryKey(),
  pastQuestionId: text('past_question_id').notNull().references(() => pastQuestions.id),
  number: text('number'),
  section: text('section'),
  text: text('text').notNull(),
  options: jsonb('options'),
  answer: text('answer'),
  marks: text('marks')
});

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  associationName: text('association_name').notNull().default('NAPS LASUSTECH'),
  chapterName: text('chapter_name'),
  shortName: text('short_name'),
  institution: text('institution'),
  faculty: text('faculty'),
  department: text('department'),
  motto: text('motto'),
  academicSession: text('academic_session'),
  currentSession: text('current_session'),
  semester: text('semester'),
  duesAmount: decimal('dues_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  bankName: text('bank_name'),
  accountNumber: text('account_number'),
  accountName: text('account_name'),
  portalNotice: text('portal_notice'),
  broadcastNotice: text('broadcast_notice'),
  emergencyNotice: text('emergency_notice'),
  registrationOpen: boolean('registration_open').notNull().default(true),
  allowRegistration: boolean('allow_registration').notNull().default(true),
  allowVoting: boolean('allow_voting').notNull().default(true),
  maintenanceMode: boolean('maintenance_mode').notNull().default(false),
  contactEmail: text('contact_email')
});

export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  reference: text('reference').notNull().unique(),
  matricNumber: text('matric_number'),
  studentName: text('student_name'),
  level: text('level'),
  session: text('session').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentType: text('payment_type'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  date: text('date'),
  status: text('status').notNull().default('Pending'),
  flwRef: text('flw_ref'),
  paymentMethod: text('payment_method')
});
