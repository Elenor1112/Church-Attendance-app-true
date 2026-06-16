import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Lang } from "@/types";

const dict = {
  churchName: { ar: "كنيسة العذراء والأنبا بيشوي", en: "Virgin Mary & St. Bishoy Church" },
  welcome: { ar: "أهلا بك", en: "Welcome" },
  welcomeBack: { ar: "أهلا بعودتك", en: "Welcome back" },
  signIn: { ar: "تسجيل الدخول", en: "Sign In" },
  signOut: { ar: "تسجيل الخروج", en: "Sign Out" },
  phone: { ar: "رقم الهاتف", en: "Phone Number" },
  password: { ar: "كلمة المرور", en: "Password" },
  newMember: { ar: "عضو جديد؟ سجل الآن", en: "New Member? Register Now" },
  register: { ar: "إنشاء حساب", en: "Create Account" },
  registration: { ar: "تسجيل عضو جديد", en: "Registration" },
  firstName: { ar: "الاسم الأول", en: "First Name" },
  lastName: { ar: "اسم العائلة", en: "Last Name" },
  birthday: { ar: "تاريخ الميلاد", en: "Birthday" },
  spousePhone: { ar: "رقم هاتف الشريك اختياري", en: "Spouse Phone Optional" },
  email: { ar: "البريد الإلكتروني اختياري", en: "Email Optional" },
  backToSignIn: { ar: "العودة لتسجيل الدخول", en: "Back to Sign In" },
  enterRole: { ar: "دخول كتجربة", en: "Continue as demo" },
  member: { ar: "عضو", en: "Member" },
  admin: { ar: "مشرف", en: "Admin" },
  superAdmin: { ar: "المشرف العام", en: "Super Admin" },
  home: { ar: "الرئيسية", en: "Home" },
  myQr: { ar: "رمز QR", en: "My QR" },
  alerts: { ar: "الإشعارات", en: "Alerts" },
  profile: { ar: "حسابي", en: "Profile" },
  verseOfDay: { ar: "آية اليوم", en: "Verse of the Day" },
  weeklyMeeting: { ar: "اجتماع الأسرة الأسبوعي", en: "Weekly Family Meeting" },
  attendance: { ar: "الحضور", en: "Attendance" },
  announcements: { ar: "الإعلانات", en: "Announcements" },
  showQr: { ar: "اعرض هذا الرمز للمشرف لتسجيل الحضور", en: "Show this QR to the gate administrator to check in." },
  approved: { ar: "معتمد", en: "Approved" },
  pending: { ar: "قيد المراجعة", en: "Pending" },
  rejected: { ar: "مرفوض", en: "Rejected" },
  active: { ar: "عضو فعال", en: "Active Member" },
  clearAll: { ar: "مسح الكل", en: "Clear All" },
  noAlerts: { ar: "لا توجد إشعارات", en: "No notifications yet" },
  noAlertsDesc: { ar: "ستظهر إشعاراتك هنا", en: "Your notifications will appear here" },
  personalInfo: { ar: "البيانات الشخصية", en: "Personal Information" },
  changePhone: { ar: "تغيير رقم الهاتف", en: "Change Phone Number" },
  editProfile: { ar: "تعديل الملف الشخصي", en: "Edit Profile" },
  scanner: { ar: "الماسح", en: "Scanner" },
  scanQr: { ar: "مسح رمز QR", en: "Scan QR Code" },
  todayCheckIns: { ar: "حضور اليوم", en: "Today's Check-ins" },
  pendingApprovals: { ar: "طلبات قيد المراجعة", en: "Pending Approvals" },
  attendanceLog: { ar: "سجل الحضور", en: "Attendance Log" },
  search: { ar: "بحث", en: "Search" },
  today: { ar: "اليوم", en: "Today" },
  thisWeek: { ar: "هذا الأسبوع", en: "This Week" },
  all: { ar: "الكل", en: "All" },
  comms: { ar: "التواصل", en: "Comms" },
  birthdays: { ar: "أعياد الميلاد", en: "Birthdays" },
  sendAlerts: { ar: "إرسال إشعار", en: "Send Alerts" },
  receipts: { ar: "تقارير القراءة", en: "Read Receipts" },
  absences: { ar: "الغيابات", en: "Absences" },
  daysLeft: { ar: "أيام متبقية", en: "days left" },
  selectAll: { ar: "تحديد الكل", en: "Select All" },
  selected: { ar: "محدد", en: "selected" },
  standardAlert: { ar: "إشعار قياسي", en: "Standard Alert" },
  customAlert: { ar: "إشعار مخصص", en: "Custom Alert" },
  writeMessage: { ar: "اكتب رسالتك...", en: "Write your message..." },
  send: { ar: "إرسال", en: "Send" },
  read: { ar: "تمت القراءة", en: "Read" },
  unread: { ar: "لم تقرأ", en: "Unread" },
  fridayAbsences: { ar: "غيابات الجمعة المتتالية", en: "Consecutive Friday Absences" },
  lastAttendance: { ar: "آخر حضور", en: "Last attendance" },
  consecutiveAbsences: { ar: "غيابات متتالية", en: "consecutive absences" },
  members: { ar: "الأعضاء", en: "Members" },
  addMember: { ar: "إضافة عضو", en: "Add Member" },
  pendingRequests: { ar: "طلبات معلقة", en: "Pending Requests" },
  approve: { ar: "قبول", en: "Approve" },
  reject: { ar: "رفض", en: "Reject" },
  dashboard: { ar: "لوحة التحكم", en: "Dashboard" },
  totalMembers: { ar: "إجمالي الأعضاء", en: "Total Members" },
  totalAdmins: { ar: "إجمالي المشرفين", en: "Total Admins" },
  membersCenter: { ar: "مركز الأعضاء", en: "Members Center" },
  role: { ar: "الدور", en: "Role" },
  status: { ar: "الحالة", en: "Status" },
  registeredOn: { ar: "تاريخ التسجيل", en: "Registered" },
  approvedBy: { ar: "اعتمده", en: "Approved by" },
  scannedBy: { ar: "تم مسحه بواسطة", en: "Scanned by" },
  recentActivity: { ar: "النشاط الأخير", en: "Recent Activity" },
  registeredMembers: { ar: "عضو مسجل", en: "registered members" },
  save: { ar: "حفظ", en: "Save" },
  share: { ar: "مشاركة", en: "Share" },
  loading: { ar: "جار التحميل", en: "Loading" },
  retry: { ar: "إعادة المحاولة", en: "Retry" },
  offline: { ar: "أنت غير متصل", en: "You are offline" },
  cameraPermission: { ar: "نحتاج إذن الكاميرا لمسح رمز QR", en: "Camera permission is needed to scan QR codes" },
  allowCamera: { ar: "السماح بالكاميرا", en: "Allow Camera" },
  manualEntry: { ar: "إدخال يدوي", en: "Manual Entry" },
  qrRecorded: { ar: "تم تسجيل الحضور", en: "Attendance recorded" },
  invalidQr: { ar: "رمز QR غير صالح", en: "Invalid QR code" },
  pullToRefresh: { ar: "اسحب للتحديث", en: "Pull to refresh" },
  imageUpdated: { ar: "تم تحديث الصورة", en: "Photo updated" },
  language: { ar: "العربية", en: "English" },
  // Friday categories
  fridayCategory: { ar: "فئة الجمعة", en: "Friday Category" },
  selectCategory: { ar: "اختر الفئة", en: "Select Category" },
  contemporaryIssues: { ar: "قضايا معاصرة", en: "Contemporary Issues" },
  bibleStudy: { ar: "كتاب مقدس", en: "Bible Study" },
  spirituality: { ar: "روحانيات", en: "Spirituality" },
  saintsLives: { ar: "سير قديسين", en: "Lives of Saints" },
  confirmScan: { ar: "تأكيد المسح", en: "Confirm Scan" },
  scanSuccess: { ar: "تم تسجيل الحضور بنجاح", en: "Attendance recorded successfully" },
  // Set completion
  setCompletions: { ar: "مجموعات مكتملة", en: "Set Completions" },
  completedSets: { ar: "عدد المجموعات المكتملة", en: "Completed Sets" },
  setCompleted: { ar: "أكمل مجموعة الجمعة الكاملة!", en: "Completed a full Friday set!" },
  acknowledge: { ar: "إقرار", en: "Acknowledge" },
  acknowledged: { ar: "تم الإقرار", en: "Acknowledged" },
  pendingSets: { ar: "مجموعات معلقة", en: "Pending Sets" },
  currentSetProgress: { ar: "تقدم المجموعة الحالية", en: "Current Set Progress" },
  setProgressDesc: { ar: "الفئات المكتملة من المجموعة الحالية", en: "Categories completed in current set" },
  // Admin permissions
  createAdmin: { ar: "إنشاء مشرف", en: "Create Admin" },
  adminPermissions: { ar: "صلاحيات المشرف", en: "Admin Permissions" },
  editPermissions: { ar: "تعديل الصلاحيات", en: "Edit Permissions" },
  permScan: { ar: "مسح QR", en: "Scan QR Codes" },
  permViewLogs: { ar: "عرض السجلات", en: "View Attendance Logs" },
  permSendMessages: { ar: "إرسال رسائل للأعضاء", en: "Send Messages to Members" },
  permGenerateReports: { ar: "إنشاء تقارير", en: "Generate Reports" },
  noPermissions: { ar: "لا توجد صلاحيات", en: "No Permissions" },
  notAuthorized: { ar: "غير مصرح لك", en: "Not Authorized" },
  notAuthorizedDesc: { ar: "ليس لديك صلاحية الوصول إلى هذه الصفحة", en: "You do not have permission to access this page" },
  composeMessage: { ar: "إنشاء رسالة", en: "Compose Message" },
  allMembers: { ar: "جميع الأعضاء", en: "All Members" },
  messageSent: { ar: "تم إرسال الرسالة بنجاح", en: "Message sent successfully" },
};

type Key = keyof typeof dict;
type ContextValue = {
  lang: Lang;
  isRtl: boolean;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: (key: Key) => string;
};

const LanguageContext = createContext<ContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");
  const value = useMemo(
    () => ({
      lang,
      isRtl: lang === "ar",
      setLang,
      toggle: () => setLang((current) => (current === "ar" ? "en" : "ar")),
      t: (key: Key) => dict[key]?.[lang] ?? key,
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLang must be used inside LanguageProvider");
  return context;
}
