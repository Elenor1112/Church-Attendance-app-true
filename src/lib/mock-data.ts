export const currentUser = {
  name: { ar: "مينا عادل", en: "Mina Adel" },
  initials: "MA",
  phone: "+20 100 123 4567",
  email: "mina.adel@example.com",
  birthday: "1995-04-12",
  status: "approved" as const,
};

export const verse = {
  ar: "«أنا هو الطريق والحق والحياة. لا يأتي أحد إلى الآب إلا بي.»",
  en: "“I am the way, the truth, and the life. No one comes to the Father except through Me.”",
  ref: { ar: "يوحنا ١٤:٦", en: "John 14:6" },
};

export const meeting = {
  title: { ar: "اجتماع الأسرة", en: "Family Meeting" },
  date: { ar: "الجمعة ٢٠ يونيو", en: "Friday, June 20" },
  time: { ar: "٧:٠٠ مساءً", en: "7:00 PM" },
  location: { ar: "قاعة الكنيسة الكبرى", en: "Main Church Hall" },
};

export const memberNotifications = [
  { id: "1", title: { ar: "اجتماع غداً", en: "Meeting tomorrow" }, body: { ar: "تذكير بحضور اجتماع الأسرة غداً ٧ مساءً", en: "Reminder: family meeting tomorrow at 7 PM" }, time: { ar: "منذ ساعتين", en: "2h ago" }, unread: true },
  { id: "2", title: { ar: "كل سنة وأنت طيب", en: "Happy Birthday!" }, body: { ar: "نتمنى لك سنة مباركة", en: "Wishing you a blessed year ahead" }, time: { ar: "اليوم", en: "Today" }, unread: true },
  { id: "3", title: { ar: "تم تأكيد حضورك", en: "Attendance recorded" }, body: { ar: "تم تسجيل حضورك يوم الجمعة", en: "Your Friday attendance was recorded" }, time: { ar: "منذ ٣ أيام", en: "3d ago" }, unread: false },
  { id: "4", title: { ar: "إعلان عام", en: "Announcement" }, body: { ar: "موعد القداس الإلهي الأحد ٨ صباحاً", en: "Sunday Divine Liturgy at 8 AM" }, time: { ar: "الأسبوع الماضي", en: "Last week" }, unread: false },
];

export const attendanceLogs = [
  { id: "1", name: { ar: "مارينا سمير", en: "Marina Samir" }, time: "07:42 PM", date: { ar: "اليوم", en: "Today" }, status: "on-time" as const },
  { id: "2", name: { ar: "بيتر يوسف", en: "Peter Youssef" }, time: "07:48 PM", date: { ar: "اليوم", en: "Today" }, status: "on-time" as const },
  { id: "3", name: { ar: "مريم جرجس", en: "Mariam Girgis" }, time: "08:05 PM", date: { ar: "اليوم", en: "Today" }, status: "late" as const },
  { id: "4", name: { ar: "أندرو فايز", en: "Andrew Fayez" }, time: "07:30 PM", date: { ar: "أمس", en: "Yesterday" }, status: "on-time" as const },
  { id: "5", name: { ar: "نانسي إيهاب", en: "Nancy Ehab" }, time: "07:55 PM", date: { ar: "أمس", en: "Yesterday" }, status: "on-time" as const },
];

export const upcomingBirthdays = [
  { id: "1", name: { ar: "كيرلس ناجي", en: "Kyrillos Nagy" }, date: { ar: "١٨ يونيو", en: "June 18" }, days: 3 },
  { id: "2", name: { ar: "ماريان عماد", en: "Maryan Emad" }, date: { ar: "٢١ يونيو", en: "June 21" }, days: 6 },
  { id: "3", name: { ar: "بيشوي رؤوف", en: "Bishoy Raouf" }, date: { ar: "٢٥ يونيو", en: "June 25" }, days: 10 },
];

export const allMembers = [
  { id: "1", name: { ar: "مارينا سمير", en: "Marina Samir" }, phone: "+20 100 222 1111", role: "member" as const, status: "approved" as const, registered: "2024-09-12", approvedBy: { ar: "أ. جورج", en: "A. George" }, lastAttendance: { ar: "اليوم", en: "Today" }, scannedBy: { ar: "أ. جورج", en: "A. George" } },
  { id: "2", name: { ar: "بيتر يوسف", en: "Peter Youssef" }, phone: "+20 100 222 2222", role: "member" as const, status: "approved" as const, registered: "2024-08-30", approvedBy: { ar: "أ. جورج", en: "A. George" }, lastAttendance: { ar: "أمس", en: "Yesterday" }, scannedBy: { ar: "أ. ميخائيل", en: "A. Michael" } },
  { id: "3", name: { ar: "نانسي إيهاب", en: "Nancy Ehab" }, phone: "+20 100 222 3333", role: "member" as const, status: "pending" as const, registered: "2025-06-10", approvedBy: null, lastAttendance: null, scannedBy: null },
  { id: "4", name: { ar: "أ. جورج صموئيل", en: "Mr. George Samuel" }, phone: "+20 100 222 4444", role: "admin" as const, status: "approved" as const, registered: "2023-02-01", approvedBy: { ar: "النظام", en: "System" }, lastAttendance: { ar: "اليوم", en: "Today" }, scannedBy: null },
  { id: "5", name: { ar: "أندرو فايز", en: "Andrew Fayez" }, phone: "+20 100 222 5555", role: "member" as const, status: "rejected" as const, registered: "2025-05-22", approvedBy: null, lastAttendance: null, scannedBy: null },
  { id: "6", name: { ar: "د. مرقس حنا", en: "Dr. Marcus Hanna" }, phone: "+20 100 222 6666", role: "super-admin" as const, status: "approved" as const, registered: "2022-01-15", approvedBy: { ar: "النظام", en: "System" }, lastAttendance: { ar: "اليوم", en: "Today" }, scannedBy: null },
];

export const pendingRequests = allMembers.filter((m) => m.status === "pending").concat([
  { id: "7", name: { ar: "ساندي ميلاد", en: "Sandy Milad" }, phone: "+20 100 333 7777", role: "member" as const, status: "pending" as const, registered: "2025-06-11", approvedBy: null, lastAttendance: null, scannedBy: null },
  { id: "8", name: { ar: "مايكل عاطف", en: "Michael Atef" }, phone: "+20 100 333 8888", role: "member" as const, status: "pending" as const, registered: "2025-06-12", approvedBy: null, lastAttendance: null, scannedBy: null },
]);

export const fridayAbsences = [
  { id: "1", name: { ar: "رامي شوقي", en: "Ramy Shawky" }, last: { ar: "٣٠ مايو", en: "May 30" }, streak: 3 },
  { id: "2", name: { ar: "إيرين ناصر", en: "Irene Nasser" }, last: { ar: "٢٣ مايو", en: "May 23" }, streak: 4 },
  { id: "3", name: { ar: "فادي عاطف", en: "Fady Atef" }, last: { ar: "٦ يونيو", en: "June 6" }, streak: 2 },
];

export const recentActivity = [
  { id: "1", text: { ar: "تم اعتماد ساندي ميلاد", en: "Sandy Milad approved" }, time: { ar: "منذ ١٠ دقائق", en: "10m ago" } },
  { id: "2", text: { ar: "تسجيل حضور ١٢ عضواً", en: "12 members checked in" }, time: { ar: "منذ ساعة", en: "1h ago" } },
  { id: "3", text: { ar: "طلب جديد من مايكل عاطف", en: "New request from Michael Atef" }, time: { ar: "منذ ٣ ساعات", en: "3h ago" } },
];
