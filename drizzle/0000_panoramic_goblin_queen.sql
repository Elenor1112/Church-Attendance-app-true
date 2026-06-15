CREATE TABLE IF NOT EXISTS "activity_logs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"text_ar" varchar(255) NOT NULL,
	"text_en" varchar(255) NOT NULL,
	"time_ar" varchar(50) NOT NULL,
	"time_en" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attendance_logs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"member_id" varchar(50) NOT NULL,
	"date_ar" varchar(50) NOT NULL,
	"date_en" varchar(50) NOT NULL,
	"time" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'on-time' NOT NULL,
	"scanned_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meetings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_ar" varchar(255) NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"date_ar" varchar(255) NOT NULL,
	"date_en" varchar(255) NOT NULL,
	"time_ar" varchar(255) NOT NULL,
	"time_en" varchar(255) NOT NULL,
	"location_ar" varchar(255) NOT NULL,
	"location_en" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "members" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"phone" varchar(50) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"email" varchar(255),
	"birthday" varchar(50),
	"spouse_phone" varchar(50),
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"registered" varchar(50) NOT NULL,
	"approved_by" varchar(255),
	"photo_uri" text,
	CONSTRAINT "members_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"title_ar" varchar(255) NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"body_ar" text NOT NULL,
	"body_en" text NOT NULL,
	"time_ar" varchar(50) NOT NULL,
	"time_en" varchar(50) NOT NULL,
	"unread" boolean DEFAULT true NOT NULL,
	"user_id" varchar(50)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verses" (
	"id" serial PRIMARY KEY NOT NULL,
	"verse_ar" text NOT NULL,
	"verse_en" text NOT NULL,
	"ref_ar" varchar(255) NOT NULL,
	"ref_en" varchar(255) NOT NULL,
	"active" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_members_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
