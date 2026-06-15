export type Lang = "ar" | "en";

export type Localized = {
  ar: string;
  en: string;
};

export type Role = "member" | "admin" | "super-admin";
export type MemberStatus = "approved" | "pending" | "rejected";

export type User = {
  id: string;
  name: Localized;
  initials: string;
  phone: string;
  email?: string;
  birthday?: string;
  spousePhone?: string;
  role: Role;
  status: MemberStatus;
  photoUri?: string;
};

export type MemberRecord = User & {
  registered: string;
  approvedBy: Localized | null;
  lastAttendance: Localized | null;
  scannedBy: Localized | null;
  attendanceHistory: AttendanceLog[];
};

export type NotificationItem = {
  id: string;
  title: Localized;
  body: Localized;
  time: Localized;
  unread: boolean;
};

export type AttendanceLog = {
  id: string;
  memberId: string;
  name: Localized;
  time: string;
  date: Localized;
  status: "on-time" | "late";
  scannedBy?: Localized;
};

export type Birthday = {
  id: string;
  name: Localized;
  date: Localized;
  days: number;
};

export type Absence = {
  id: string;
  name: Localized;
  last: Localized;
  streak: number;
};

export type ReadReceipt = {
  id: string;
  label: Localized;
  read: number;
  total: number;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type LoginInput = {
  phone: string;
  password: string;
  role?: Role;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  phone: string;
  birthday: string;
  spousePhone?: string;
  email?: string;
  password: string;
};

export type ManualMemberInput = RegisterInput & {
  role: Role;
};

export type SendAlertInput = {
  type: "standard" | "custom";
  message: string;
  recipientIds: string[];
};

export type DashboardStats = {
  totalMembers: number;
  totalAdmins: number;
  todayCheckIns: number;
  pendingApprovals: number;
};
