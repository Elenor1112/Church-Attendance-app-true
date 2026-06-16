import { db, pool } from "./index";
import { members, verses, meetings, notifications, attendanceLogs, activityLogs, setNotifications, adminPermissions } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Starting database seeding...");

  const demoPasswordHash = await bcrypt.hash("demo", 10);

  // 1. Clean existing records (order matters for FK constraints)
  console.log("Cleaning existing records...");
  await db.delete(adminPermissions);
  await db.delete(setNotifications);
  await db.delete(activityLogs);
  await db.delete(attendanceLogs);
  await db.delete(notifications);
  await db.delete(members);
  await db.delete(meetings);
  await db.delete(verses);

  // 2. Seed Members
  console.log("Seeding members...");
  await db.insert(members).values([
    {
      id: "m-1",
      phone: "+20 100 123 4567",
      nameAr: "مينا عادل",
      nameEn: "Mina Adel",
      email: "mina.adel@example.com",
      birthday: "1995-04-12",
      spousePhone: "",
      passwordHash: demoPasswordHash,
      role: "member",
      status: "approved",
      registered: "2024-05-15",
      approvedBy: "System",
      photoUri: "",
      completedSets: 1,
    },
    {
      id: "m-2",
      phone: "+20 100 222 1111",
      nameAr: "مارينا سمير",
      nameEn: "Marina Samir",
      email: "marina.samir@example.com",
      birthday: "1998-09-22",
      spousePhone: "",
      passwordHash: demoPasswordHash,
      role: "member",
      status: "approved",
      registered: "2024-09-12",
      approvedBy: "Mr. George Samuel",
      photoUri: "",
      completedSets: 0,
    },
    {
      id: "m-3",
      phone: "+20 100 222 2222",
      nameAr: "بيتر يوسف",
      nameEn: "Peter Youssef",
      email: "peter.youssef@example.com",
      birthday: "1993-11-05",
      spousePhone: "",
      passwordHash: demoPasswordHash,
      role: "member",
      status: "approved",
      registered: "2024-08-30",
      approvedBy: "Mr. George Samuel",
      photoUri: "",
      completedSets: 0,
    },
    {
      id: "m-4",
      phone: "+20 100 222 3333",
      nameAr: "نانسي إيهاب",
      nameEn: "Nancy Ehab",
      email: "nancy.ehab@example.com",
      birthday: "2000-02-14",
      spousePhone: "",
      passwordHash: demoPasswordHash,
      role: "member",
      status: "pending",
      registered: "2025-06-10",
      approvedBy: "",
      photoUri: "",
      completedSets: 0,
    },
    {
      id: "m-5",
      phone: "+20 100 222 4444",
      nameAr: "أ. جورج صموئيل",
      nameEn: "Mr. George Samuel",
      email: "george.samuel@example.com",
      birthday: "1980-07-19",
      spousePhone: "",
      passwordHash: demoPasswordHash,
      role: "admin",
      status: "approved",
      registered: "2023-02-01",
      approvedBy: "System",
      photoUri: "",
      completedSets: 0,
    },
    {
      id: "m-6",
      phone: "+20 100 222 5555",
      nameAr: "أندرو فايز",
      nameEn: "Andrew Fayez",
      email: "andrew.fayez@example.com",
      birthday: "1996-12-30",
      spousePhone: "",
      passwordHash: demoPasswordHash,
      role: "member",
      status: "rejected",
      registered: "2025-05-22",
      approvedBy: "",
      photoUri: "",
      completedSets: 0,
    },
    {
      id: "m-7",
      phone: "+20 100 222 6666",
      nameAr: "د. مرقس حنا",
      nameEn: "Dr. Marcus Hanna",
      email: "marcus.hanna@example.com",
      birthday: "1975-03-08",
      spousePhone: "",
      passwordHash: demoPasswordHash,
      role: "super-admin",
      status: "approved",
      registered: "2022-01-15",
      approvedBy: "System",
      photoUri: "",
      completedSets: 0,
    },
    {
      id: "m-8",
      phone: "+20 100 333 7777",
      nameAr: "ساندي ميلاد",
      nameEn: "Sandy Milad",
      email: "sandy.milad@example.com",
      birthday: "2002-10-10",
      spousePhone: "",
      passwordHash: demoPasswordHash,
      role: "member",
      status: "pending",
      registered: "2025-06-11",
      approvedBy: "",
      photoUri: "",
      completedSets: 0,
    },
    {
      id: "m-9",
      phone: "+20 100 333 8888",
      nameAr: "مايكل عاطف",
      nameEn: "Michael Atef",
      email: "michael.atef@example.com",
      birthday: "1994-08-25",
      spousePhone: "",
      passwordHash: demoPasswordHash,
      role: "member",
      status: "pending",
      registered: "2025-06-12",
      approvedBy: "",
      photoUri: "",
      completedSets: 0,
    },
    // Admin with limited permissions (only scan + view_logs)
    {
      id: "m-10",
      phone: "+20 100 444 9999",
      nameAr: "إيليا ناصر",
      nameEn: "Elia Nasser",
      email: "elia.nasser@example.com",
      birthday: "1985-06-20",
      spousePhone: "",
      passwordHash: demoPasswordHash,
      role: "admin",
      status: "approved",
      registered: "2024-01-10",
      approvedBy: "Dr. Marcus Hanna",
      photoUri: "",
      completedSets: 0,
    },
  ]);

  // 3. Seed Verses
  console.log("Seeding verses...");
  await db.insert(verses).values([
    {
      verseAr: "«أنا هو الطريق والحق والحياة. لا يأتي أحد إلى الآب إلا بي.»",
      verseEn: "“I am the way, the truth, and the life. No one comes to the Father except through Me.”",
      refAr: "يوحنا ١٤:٦",
      refEn: "John 14:6",
      active: true,
    },
  ]);

  // 4. Seed Meetings
  console.log("Seeding meetings...");
  await db.insert(meetings).values([
    {
      titleAr: "اجتماع الأسرة",
      titleEn: "Family Meeting",
      dateAr: "الجمعة ٢٠ يونيو",
      dateEn: "Friday, June 20",
      timeAr: "٧:٠٠ مساءً",
      timeEn: "7:00 PM",
      locationAr: "قاعة الكنيسة الكبرى",
      locationEn: "Main Church Hall",
    },
  ]);

  // 5. Seed Attendance Logs — includes all 4 Friday categories for Mina Adel (completed set)
  console.log("Seeding attendance logs...");
  await db.insert(attendanceLogs).values([
    // Mina Adel completes a full Friday set
    {
      id: "scan-1001",
      memberId: "m-1",
      dateAr: "الجمعة ٧ يونيو",
      dateEn: "Friday, June 7",
      time: "07:10 PM",
      status: "on-time",
      scannedBy: "Mr. George Samuel",
      fridayCategory: "contemporary_issues",
    },
    {
      id: "scan-1002",
      memberId: "m-1",
      dateAr: "الجمعة ١٤ يونيو",
      dateEn: "Friday, June 14",
      time: "07:05 PM",
      status: "on-time",
      scannedBy: "Mr. George Samuel",
      fridayCategory: "bible_study",
    },
    {
      id: "scan-1003",
      memberId: "m-1",
      dateAr: "الجمعة ٢١ يونيو",
      dateEn: "Friday, June 21",
      time: "07:08 PM",
      status: "on-time",
      scannedBy: "Mr. George Samuel",
      fridayCategory: "spirituality",
    },
    {
      id: "scan-1004",
      memberId: "m-1",
      dateAr: "الجمعة ٢٨ يونيو",
      dateEn: "Friday, June 28",
      time: "07:15 PM",
      status: "on-time",
      scannedBy: "Mr. George Samuel",
      fridayCategory: "saints_lives",
    },
    // Marina Samir partial set (3 of 4)
    {
      id: "scan-2001",
      memberId: "m-2",
      dateAr: "الجمعة ٧ يونيو",
      dateEn: "Friday, June 7",
      time: "07:22 PM",
      status: "on-time",
      scannedBy: "Mr. George Samuel",
      fridayCategory: "contemporary_issues",
    },
    {
      id: "scan-2002",
      memberId: "m-2",
      dateAr: "الجمعة ١٤ يونيو",
      dateEn: "Friday, June 14",
      time: "07:19 PM",
      status: "on-time",
      scannedBy: "Mr. George Samuel",
      fridayCategory: "bible_study",
    },
    {
      id: "scan-2003",
      memberId: "m-2",
      dateAr: "اليوم",
      dateEn: "Today",
      time: "07:42 PM",
      status: "on-time",
      scannedBy: "Mr. George Samuel",
      fridayCategory: "spirituality",
    },
    // Peter regular attendance (no category)
    {
      id: "scan-3001",
      memberId: "m-3",
      dateAr: "اليوم",
      dateEn: "Today",
      time: "07:48 PM",
      status: "on-time",
      scannedBy: "Mr. George Samuel",
      fridayCategory: null,
    },
  ]);

  // 6. Seed Notifications
  console.log("Seeding notifications...");
  await db.insert(notifications).values([
    {
      id: "n-1",
      titleAr: "اجتماع غداً",
      titleEn: "Meeting tomorrow",
      bodyAr: "تذكير بحضور اجتماع الأسرة غداً ٧ مساءً",
      bodyEn: "Reminder: family meeting tomorrow at 7 PM",
      timeAr: "منذ ساعتين",
      timeEn: "2h ago",
      unread: true,
      userId: "m-1",
    },
    {
      id: "n-2",
      titleAr: "كل سنة وأنت طيب",
      titleEn: "Happy Birthday!",
      bodyAr: "نتمنى لك سنة مباركة",
      bodyEn: "Wishing you a blessed year ahead",
      timeAr: "اليوم",
      timeEn: "Today",
      unread: true,
      userId: "m-1",
    },
    {
      id: "n-3",
      titleAr: "تم تأكيد حضورك",
      titleEn: "Attendance recorded",
      bodyAr: "تم تسجيل حضورك يوم الجمعة",
      bodyEn: "Your Friday attendance was recorded",
      timeAr: "منذ ٣ أيام",
      timeEn: "3d ago",
      unread: false,
      userId: "m-1",
    },
    {
      id: "n-4",
      titleAr: "إعلان عام",
      titleEn: "Announcement",
      bodyAr: "موعد القداس الإلهي الأحد ٨ صباحاً",
      bodyEn: "Sunday Divine Liturgy at 8 AM",
      timeAr: "الأسبوع الماضي",
      timeEn: "Last week",
      unread: false,
      userId: null,
    },
    // Set completion notification for admins
    {
      id: "n-set-sn-demo-m-5",
      titleAr: "🎁 إتمام مجموعة الجمعة",
      titleEn: "🎁 Friday Set Completed",
      bodyAr: "مينا عادل أكمل مجموعة الجمعة الكاملة! (رمز الإشعار: sn-demo)",
      bodyEn: "Mina Adel has completed a full Friday set! (ref: sn-demo)",
      timeAr: "منذ أسبوع",
      timeEn: "1w ago",
      unread: true,
      userId: "m-5",
    },
    {
      id: "n-set-sn-demo-m-7",
      titleAr: "🎁 إتمام مجموعة الجمعة",
      titleEn: "🎁 Friday Set Completed",
      bodyAr: "مينا عادل أكمل مجموعة الجمعة الكاملة! (رمز الإشعار: sn-demo)",
      bodyEn: "Mina Adel has completed a full Friday set! (ref: sn-demo)",
      timeAr: "منذ أسبوع",
      timeEn: "1w ago",
      unread: true,
      userId: "m-7",
    },
  ]);

  // 7. Seed Set Notification (acknowledged — Mina's first set)
  console.log("Seeding set notifications...");
  await db.insert(setNotifications).values([
    {
      id: "sn-demo",
      memberId: "m-1",
      triggeredAt: new Date("2026-06-09T19:15:00Z"),
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
    },
  ]);

  // 8. Seed Admin Permissions — George has scan+view_logs+send_messages; Elia has only scan+view_logs
  console.log("Seeding admin permissions...");
  await db.insert(adminPermissions).values([
    { id: "perm-m-5-scan", memberId: "m-5", permission: "scan", grantedBy: "m-7", grantedAt: new Date("2023-02-01") },
    { id: "perm-m-5-view_logs", memberId: "m-5", permission: "view_logs", grantedBy: "m-7", grantedAt: new Date("2023-02-01") },
    { id: "perm-m-5-send_messages", memberId: "m-5", permission: "send_messages", grantedBy: "m-7", grantedAt: new Date("2023-02-01") },
    { id: "perm-m-10-scan", memberId: "m-10", permission: "scan", grantedBy: "m-7", grantedAt: new Date("2024-01-10") },
    { id: "perm-m-10-view_logs", memberId: "m-10", permission: "view_logs", grantedBy: "m-7", grantedAt: new Date("2024-01-10") },
  ]);

  // 9. Seed Activity Logs
  console.log("Seeding activity logs...");
  await db.insert(activityLogs).values([
    { id: "act-1", textAr: "تم اعتماد ساندي ميلاد", textEn: "Sandy Milad approved", timeAr: "منذ ١٠ دقائق", timeEn: "10m ago" },
    { id: "act-2", textAr: "تسجيل حضور ١٢ عضواً", textEn: "12 members checked in", timeAr: "منذ ساعة", timeEn: "1h ago" },
    { id: "act-3", textAr: "طلب جديد من مايكل عاطف", textEn: "New request from Michael Atef", timeAr: "منذ ٣ ساعات", timeEn: "3h ago" },
  ]);

  console.log("Database seeded successfully!");
}

seed()
  .then(() => { pool.end(); process.exit(0); })
  .catch((err) => { console.error("Seeding failed:", err); pool.end(); process.exit(1); });
