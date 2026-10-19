CREATE TABLE "awards" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"recipient" text NOT NULL,
	"year" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"image" text,
	"certificate_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "constitution_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"number" text NOT NULL,
	"title" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "constitution_document" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"pdf_url" text DEFAULT '',
	"file_name" text DEFAULT '',
	"file_size" text DEFAULT '',
	"updated_at" text DEFAULT '',
	"published" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "constitution_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_info" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"phone" text NOT NULL,
	"alternative_phone" text,
	"email" text NOT NULL,
	"secretariat_email" text,
	"office_address" text,
	"address" text,
	"faculty" text,
	"campus" text,
	"twitter" text,
	"instagram" text,
	"linkedin" text,
	"telegram" text,
	"whatsapp" text,
	"whatsapp_group" text,
	"operating_hours" text,
	"office_hours" text
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"description" text NOT NULL,
	"image" text NOT NULL,
	"upcoming" boolean DEFAULT false,
	"ongoing" boolean DEFAULT false,
	"contain" boolean DEFAULT false,
	"event_tag" text,
	"time" text,
	"venue" text,
	"registration_info" text,
	"registration_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_albums" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"event_tag" text NOT NULL,
	"date" text NOT NULL,
	"date_sort_value" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"album_id" text NOT NULL,
	"url" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "navigation_menu" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"target_view" text NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_external" boolean DEFAULT false,
	"external_url" text,
	"badge" text
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_resets_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "past_question_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"past_question_id" text NOT NULL,
	"url" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "past_question_manuals" (
	"id" text PRIMARY KEY NOT NULL,
	"past_question_id" text NOT NULL,
	"number" text NOT NULL,
	"section" text,
	"text" text NOT NULL,
	"options" jsonb,
	"answer" text,
	"marks" text,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "past_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"course_code" text NOT NULL,
	"course_title" text NOT NULL,
	"level" text NOT NULL,
	"semester" text NOT NULL,
	"session" text NOT NULL,
	"exam_type" text NOT NULL,
	"downloads" integer DEFAULT 0 NOT NULL,
	"file_size" text NOT NULL,
	"format_type" text,
	"department" text,
	"instructions" text,
	"duration" text,
	"pdf_url" text,
	"pdf_file_name" text,
	"manual_content" text,
	"uploaded_at" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"post" text NOT NULL,
	"level" text NOT NULL,
	"description" text NOT NULL,
	"bio" text,
	"image" text NOT NULL,
	"category" text NOT NULL,
	"phone" text,
	"email" text,
	"department" text,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"association_name" text DEFAULT 'National Association of Physics Students' NOT NULL,
	"chapter_name" text,
	"short_name" text,
	"institution" text,
	"faculty" text,
	"department" text,
	"motto" text,
	"academic_session" text,
	"current_session" text,
	"semester" text,
	"dues_amount" integer DEFAULT 0 NOT NULL,
	"bank_name" text,
	"account_number" text,
	"account_name" text,
	"portal_notice" text,
	"broadcast_notice" text,
	"emergency_notice" text,
	"registration_open" boolean DEFAULT true,
	"allow_registration" boolean DEFAULT true,
	"allow_voting" boolean DEFAULT false,
	"maintenance_mode" boolean DEFAULT false,
	"contact_email" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"matric_number" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"whatsapp_number" text,
	"phone_number" text,
	"level" text NOT NULL,
	"discipline" text NOT NULL,
	"gender" text,
	"birthday" text,
	"post" text,
	"dues_status" text DEFAULT 'Pending' NOT NULL,
	"id_card_status" text,
	"attendance" integer DEFAULT 0,
	"resources" integer DEFAULT 0,
	"profile_image" text,
	"role" text DEFAULT 'student' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_account_active" boolean DEFAULT true,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"last_login_at" timestamp,
	CONSTRAINT "users_matric_number_unique" UNIQUE("matric_number"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category_id" text NOT NULL,
	"nominee_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voting_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"group_key" text NOT NULL,
	"group_name" text NOT NULL,
	"description" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voting_nominees" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"name" text NOT NULL,
	"level" text NOT NULL,
	"discipline" text NOT NULL,
	"image" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "voting_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"is_open" boolean DEFAULT false NOT NULL,
	"title" text,
	"election_title" text,
	"session" text,
	"instructions" text,
	"start_date" text,
	"end_date" text,
	"allow_multiple_categories_vote" boolean DEFAULT false,
	"one_vote_per_user" boolean DEFAULT true,
	"require_biometrics" boolean DEFAULT false,
	"strict_matric_validation" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "constitution_articles" ADD CONSTRAINT "constitution_articles_document_id_constitution_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."constitution_document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "constitution_sections" ADD CONSTRAINT "constitution_sections_article_id_constitution_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."constitution_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_album_id_gallery_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."gallery_albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "past_question_images" ADD CONSTRAINT "past_question_images_past_question_id_past_questions_id_fk" FOREIGN KEY ("past_question_id") REFERENCES "public"."past_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "past_question_manuals" ADD CONSTRAINT "past_question_manuals_past_question_id_past_questions_id_fk" FOREIGN KEY ("past_question_id") REFERENCES "public"."past_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_category_id_voting_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."voting_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_nominee_id_voting_nominees_id_fk" FOREIGN KEY ("nominee_id") REFERENCES "public"."voting_nominees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voting_nominees" ADD CONSTRAINT "voting_nominees_category_id_voting_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."voting_categories"("id") ON DELETE cascade ON UPDATE no action;