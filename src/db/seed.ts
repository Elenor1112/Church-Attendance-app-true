import { db, pool } from "./index";
import {
  members,
  verses,
  meetings,
  notifications,
  attendanceLogs,
  activityLogs,
  setNotifications,
  adminPermissions,
  messageReads,
} from "./schema";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// PRODUCTION SEED
// Creates exactly ONE Super Admin account and minimal church content.
// No demo / test members, admins, or attendance data are created.
//
//   Super Admin login:
//     Phone:    01000000001
//     Password: ChangeMe@123   (change immediately after first login)
// ---------------------------------------------------------------------------

const SUPER_ADMIN_PHONE = "01000000001";
const SUPER_ADMIN_PASSWORD = "ChangeMe@123";

async function seed() {
  console.log("Starting production database seeding...");

  // 1. Clean ALL existing records (order matters for FK constraints).
  console.log("Removing all existing accounts and data...");
  await db.delete(messageReads);
  await db.delete(adminPermissions);
  await db.delete(setNotifications);
  await db.delete(activityLogs);
  await db.delete(attendanceLogs);
  await db.delete(notifications);
  await db.delete(members);
  await db.delete(meetings);
  await db.delete(verses);

  // 2. Seed the single production Super Admin.
  console.log("Creating production Super Admin...");
  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
  await db.insert(members).values({
    id: "super-admin",
    phone: SUPER_ADMIN_PHONE,
    nameAr: "المشرف العام",
    nameEn: "Super Admin",
    email: null,
    birthday: null,
    spousePhone: null,
    passwordHash,
    role: "super-admin",
    status: "approved",
    registered: new Date().toISOString().slice(0, 10),
    approvedBy: "System",
    photoUri: null,
    completedSets: 0,
    active: true,
  });

  // 3. Seed an active verse so the member home page has content.
  console.log("Seeding verse of the day...");
  await db.insert(verses).values([
    {
      verseAr: "«أنا هو الطريق والحق والحياة. لا يأتي أحد إلى الآب إلا بي.»",
      verseEn: "I am the way, the truth, and the life. No one comes to the Father except through Me.",
      refAr: "يوحنا ١٤:٦",
      refEn: "John 14:6",
      active: true,
    },
  ]);

  // 4. Seed an upcoming meeting.
  console.log("Seeding meeting...");
  await db.insert(meetings).values([
    {
      titleAr: "اجتماع الأسرة",
      titleEn: "Family Meeting",
      dateAr: "الجمعة",
      dateEn: "Friday",
      timeAr: "٧:٠٠ مساءً",
      timeEn: "7:00 PM",
      locationAr: "قاعة الكنيسة الكبرى",
      locationEn: "Main Church Hall",
    },
  ]);

  console.log("\n✅ Production database seeded successfully!");
  console.log("\nSuper Admin account:");
  console.log(`  Phone:    ${SUPER_ADMIN_PHONE}`);
  console.log(`  Password: ${SUPER_ADMIN_PASSWORD}`);
  console.log("  ⚠️  Change this password immediately after first login.");
}

seed()
  .then(() => { pool.end(); process.exit(0); })
  .catch((err) => { console.error("Seeding failed:", err); pool.end(); process.exit(1); });
