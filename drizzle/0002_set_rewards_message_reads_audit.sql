CREATE TABLE IF NOT EXISTS "admin_permissions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"member_id" varchar(50) NOT NULL,
	"permission" varchar(50) NOT NULL,
	"granted_by" varchar(50) NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_permissions_member_id_permission_unique" UNIQUE("member_id","permission")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message_reads" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"notification_id" varchar(50) NOT NULL,
	"member_id" varchar(50) NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "message_reads_notification_id_member_id_unique" UNIQUE("notification_id","member_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "set_notifications" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"member_id" varchar(50) NOT NULL,
	"set_number" integer DEFAULT 1 NOT NULL,
	"triggered_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(30) DEFAULT 'pending_reward' NOT NULL,
	"acknowledged" boolean DEFAULT false NOT NULL,
	"acknowledged_by" varchar(50),
	"acknowledged_at" timestamp
);
--> statement-breakpoint
-- All column additions are idempotent: some columns (friday_category,
-- completed_sets, and the set_notifications table) were introduced in 0001 on
-- some databases, so we guard every change with IF NOT EXISTS.
ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "action" varchar(50);--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "actor_id" varchar(50);--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "target_id" varchar(50);--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD COLUMN IF NOT EXISTS "friday_category" varchar(50);--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD COLUMN IF NOT EXISTS "scanned_by_admin_id" varchar(50);--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "completed_sets" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "cycle_start_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
-- set_notifications may already exist from migration 0001 without these columns.
ALTER TABLE "set_notifications" ADD COLUMN IF NOT EXISTS "set_number" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "set_notifications" ADD COLUMN IF NOT EXISTS "status" varchar(30) DEFAULT 'pending_reward' NOT NULL;--> statement-breakpoint
UPDATE "set_notifications" SET "status" = 'rewarded' WHERE "acknowledged" = true AND "status" = 'pending_reward';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_granted_by_members_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "set_notifications" ADD CONSTRAINT "set_notifications_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "set_notifications" ADD CONSTRAINT "set_notifications_acknowledged_by_members_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_scanned_by_admin_id_members_id_fk" FOREIGN KEY ("scanned_by_admin_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_attendance_member" ON "attendance_logs" ("member_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_attendance_category" ON "attendance_logs" ("friday_category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_set_notifications_member" ON "set_notifications" ("member_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_set_notifications_status" ON "set_notifications" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_admin_permissions_member" ON "admin_permissions" ("member_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_user" ON "notifications" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_message_reads_member" ON "message_reads" ("member_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activity_logs_created" ON "activity_logs" ("created_at");
