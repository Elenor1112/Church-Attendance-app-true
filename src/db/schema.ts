import { pgTable, varchar, text, boolean, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";

export const members = pgTable("members", {
  id: varchar("id", { length: 50 }).primaryKey(),
  phone: varchar("phone", { length: 50 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  birthday: varchar("birthday", { length: 50 }),
  spousePhone: varchar("spouse_phone", { length: 50 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("member"), // member, admin, super-admin
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
  registered: varchar("registered", { length: 50 }).notNull(),
  approvedBy: varchar("approved_by", { length: 255 }),
  photoUri: text("photo_uri"),
  completedSets: integer("completed_sets").notNull().default(0),
  active: boolean("active").notNull().default(true), // false = deactivated admin/member
  // Marks the start of the current Friday-set cycle. Only attendance logged at/after
  // this timestamp counts toward the in-progress set. History is never deleted.
  cycleStartAt: timestamp("cycle_start_at").notNull().defaultNow(),
});

export const attendanceLogs = pgTable("attendance_logs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  memberId: varchar("member_id", { length: 50 }).notNull().references(() => members.id),
  dateAr: varchar("date_ar", { length: 50 }).notNull(),
  dateEn: varchar("date_en", { length: 50 }).notNull(),
  time: varchar("time", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("on-time"), // on-time, late, absent
  scannedBy: varchar("scanned_by", { length: 255 }),
  fridayCategory: varchar("friday_category", { length: 50 }), // contemporary_issues | bible_study | spirituality | saints_lives
  scannedByAdminId: varchar("scanned_by_admin_id", { length: 50 }).references(() => members.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const verses = pgTable("verses", {
  id: serial("id").primaryKey(),
  verseAr: text("verse_ar").notNull(),
  verseEn: text("verse_en").notNull(),
  refAr: varchar("ref_ar", { length: 255 }).notNull(),
  refEn: varchar("ref_en", { length: 255 }).notNull(),
  active: boolean("active").notNull().default(false),
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  titleAr: varchar("title_ar", { length: 255 }).notNull(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  dateAr: varchar("date_ar", { length: 255 }).notNull(),
  dateEn: varchar("date_en", { length: 255 }).notNull(),
  timeAr: varchar("time_ar", { length: 255 }).notNull(),
  timeEn: varchar("time_en", { length: 255 }).notNull(),
  locationAr: varchar("location_ar", { length: 255 }).notNull(),
  locationEn: varchar("location_en", { length: 255 }).notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 50 }).primaryKey(),
  titleAr: varchar("title_ar", { length: 255 }).notNull(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  bodyAr: text("body_ar").notNull(),
  bodyEn: text("body_en").notNull(),
  timeAr: varchar("time_ar", { length: 50 }).notNull(),
  timeEn: varchar("time_en", { length: 50 }).notNull(),
  unread: boolean("unread").notNull().default(true),
  userId: varchar("user_id", { length: 50 }).references(() => members.id), // null means global announcement
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  textAr: varchar("text_ar", { length: 255 }).notNull(),
  textEn: varchar("text_en", { length: 255 }).notNull(),
  timeAr: varchar("time_ar", { length: 50 }).notNull(),
  timeEn: varchar("time_en", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }), // attendance_scan | set_completed | reward_approved | admin_created | permissions_changed | message_sent | report_generated | admin_deactivated
  actorId: varchar("actor_id", { length: 50 }), // who performed the action
  targetId: varchar("target_id", { length: 50 }), // affected member, if any
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// A completed Friday set awaiting / having received a reward. This is the
// "member_sets" record from the spec: one row per completed set per member.
export const setNotifications = pgTable("set_notifications", {
  id: varchar("id", { length: 50 }).primaryKey(),
  memberId: varchar("member_id", { length: 50 }).notNull().references(() => members.id),
  setNumber: integer("set_number").notNull().default(1), // 1-based sequence per member
  triggeredAt: timestamp("triggered_at").notNull().defaultNow(),
  // status: pending_reward -> rewarded. `acknowledged` mirrors status === "rewarded".
  status: varchar("status", { length: 30 }).notNull().default("pending_reward"),
  acknowledged: boolean("acknowledged").notNull().default(false),
  acknowledgedBy: varchar("acknowledged_by", { length: 50 }).references(() => members.id),
  acknowledgedAt: timestamp("acknowledged_at"),
});

// Read receipts for notification-based messages (broadcast or targeted).
export const messageReads = pgTable("message_reads", {
  id: varchar("id", { length: 50 }).primaryKey(),
  notificationId: varchar("notification_id", { length: 50 }).notNull().references(() => notifications.id),
  memberId: varchar("member_id", { length: 50 }).notNull().references(() => members.id),
  readAt: timestamp("read_at").notNull().defaultNow(),
}, (table) => ({
  uniqueRead: unique().on(table.notificationId, table.memberId),
}));

export const adminPermissions = pgTable("admin_permissions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  memberId: varchar("member_id", { length: 50 }).notNull().references(() => members.id),
  permission: varchar("permission", { length: 50 }).notNull(), // scan | view_logs | send_messages | generate_reports
  grantedBy: varchar("granted_by", { length: 50 }).notNull().references(() => members.id),
  grantedAt: timestamp("granted_at").notNull().defaultNow(),
}, (table) => ({
  uniqueMemberPermission: unique().on(table.memberId, table.permission),
}));
