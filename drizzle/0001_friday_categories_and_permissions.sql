-- Migration: Friday categories + admin permissions
-- Adds: friday_category to attendance_logs, completed_sets to members,
--       set_notifications table, admin_permissions table

ALTER TABLE "attendance_logs" ADD COLUMN "friday_category" varchar(50);

ALTER TABLE "members" ADD COLUMN "completed_sets" integer NOT NULL DEFAULT 0;

CREATE TABLE "set_notifications" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"member_id" varchar(50) NOT NULL,
	"triggered_at" timestamp DEFAULT now() NOT NULL,
	"acknowledged" boolean DEFAULT false NOT NULL,
	"acknowledged_by" varchar(50),
	"acknowledged_at" timestamp
);

ALTER TABLE "set_notifications" ADD CONSTRAINT "set_notifications_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "set_notifications" ADD CONSTRAINT "set_notifications_acknowledged_by_members_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;

CREATE TABLE "admin_permissions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"member_id" varchar(50) NOT NULL,
	"permission" varchar(50) NOT NULL,
	"granted_by" varchar(50) NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_permissions_member_id_permission_unique" UNIQUE("member_id","permission")
);

ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_granted_by_members_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
