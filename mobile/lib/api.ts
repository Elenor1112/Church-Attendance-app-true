import {
  absences,
  attendanceLogs as seedAttendance,
  birthdays,
  dashboardStats,
  demoUsers,
  meeting,
  memberNotifications as seedNotifications,
  members as seedMembers,
  receipts,
  recentActivity,
  verse,
} from "@/data/mock";
import { qrPayloadSchema } from "@/lib/validation";
import type {
  AttendanceLog,
  LoginInput,
  ManualMemberInput,
  MemberRecord,
  MemberStatus,
  NotificationItem,
  RegisterInput,
  Role,
  SendAlertInput,
  Session,
  User,
} from "@/types";

let notifications: NotificationItem[] = [...seedNotifications];
let members: MemberRecord[] = [...seedMembers];
let attendanceLogs: AttendanceLog[] = [...seedAttendance];

const wait = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));
const tokenFor = (user: User) => `jwt.demo.${user.role}.${user.id}.${Date.now()}`;

function normalizeRole(role?: Role): Role {
  return role ?? "member";
}

export const api = {
  async login(input: LoginInput): Promise<Session> {
    await wait();
    const role = normalizeRole(input.role);
    const user = demoUsers[role];
    if (!user) {
      throw new Error(`Demo user not found for role: ${role}`);
    }
    return {
      accessToken: tokenFor(user),
      refreshToken: `refresh.demo.${user.id}`,
      user,
    };
  },

  async register(input: RegisterInput): Promise<{ ok: true }> {
    await wait();
    const next: MemberRecord = {
      id: `m-${Date.now()}`,
      name: { ar: `${input.firstName} ${input.lastName}`, en: `${input.firstName} ${input.lastName}` },
      initials: `${input.firstName[0] ?? ""}${input.lastName[0] ?? ""}`.toUpperCase(),
      phone: input.phone,
      email: input.email || undefined,
      birthday: input.birthday,
      spousePhone: input.spousePhone,
      role: "member",
      status: "pending",
      registered: new Date().toISOString().slice(0, 10),
      approvedBy: null,
      lastAttendance: null,
      scannedBy: null,
      attendanceHistory: [],
    };
    members = [next, ...members];
    return { ok: true };
  },

  async me(session: Session): Promise<User> {
    await wait(120);
    return session.user;
  },

  async memberHome() {
    await wait();
    return { verse, meeting, visitsThisMonth: 12, unreadAnnouncements: notifications.filter((item) => item.unread).length };
  },

  async notifications() {
    await wait();
    return notifications;
  },

  async clearNotifications() {
    await wait();
    notifications = [];
    return notifications;
  },

  async attendanceLogs(filter: "today" | "thisWeek" | "all", search = "") {
    await wait();
    const normalized = search.trim().toLowerCase();
    return attendanceLogs.filter((log) => {
      const filterOk = filter === "all" || (filter === "today" ? log.date.en === "Today" : true);
      const searchOk = !normalized || log.name.en.toLowerCase().includes(normalized) || log.name.ar.includes(search);
      return filterOk && searchOk;
    });
  },

  async adminComms() {
    await wait();
    return { birthdays, receipts, absences, approvedMembers: members.filter((member) => member.status === "approved") };
  },

  async sendAlert(input: SendAlertInput) {
    await wait();
    const next: NotificationItem = {
      id: `n-${Date.now()}`,
      title: input.type === "standard" ? { ar: "إشعار جديد", en: "New alert" } : { ar: "رسالة مخصصة", en: "Custom message" },
      body: { ar: input.message, en: input.message },
      time: { ar: "الآن", en: "Now" },
      unread: true,
    };
    notifications = [next, ...notifications];
    return { delivered: input.recipientIds.length };
  },

  async pendingMembers() {
    await wait();
    return members.filter((member) => member.status === "pending");
  },

  async updateMemberStatus(id: string, status: MemberStatus) {
    await wait();
    members = members.map((member) =>
      member.id === id
        ? {
            ...member,
            status,
            approvedBy: status === "approved" ? { ar: "أ. جورج", en: "A. George" } : member.approvedBy,
          }
        : member,
    );
    return members.find((member) => member.id === id);
  },

  async createMember(input: ManualMemberInput) {
    await this.register(input);
    members = members.map((member, index) => (index === 0 ? { ...member, role: input.role, status: "approved" } : member));
    return members[0];
  },

  async members(role: Role | "all", status: MemberStatus | "all", search = "") {
    await wait();
    const normalized = search.trim().toLowerCase();
    return members.filter((member) => {
      const roleOk = role === "all" || member.role === role;
      const statusOk = status === "all" || member.status === status;
      const searchOk = !normalized || member.name.en.toLowerCase().includes(normalized) || member.phone.includes(normalized) || member.name.ar.includes(search);
      return roleOk && statusOk && searchOk;
    });
  },

  async dashboard() {
    await wait();
    return { stats: { ...dashboardStats, pendingApprovals: members.filter((member) => member.status === "pending").length }, recentActivity };
  },

  async recordAttendance(payloadText: string, scannedBy: User) {
    await wait();
    try {
      const parsed = qrPayloadSchema.parse(JSON.parse(payloadText));
      const member = members.find((item) => item.id === parsed.memberId || item.phone === parsed.phone);
      if (!member) throw new Error("Member not found");
      const next: AttendanceLog = {
        id: `scan-${Date.now()}`,
        memberId: member.id,
        name: member.name,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: { ar: "اليوم", en: "Today" },
        status: "on-time",
        scannedBy: scannedBy.name,
      };
      attendanceLogs = [next, ...attendanceLogs];
      members = members.map((item) =>
        item.id === member.id
          ? { ...item, lastAttendance: { ar: "اليوم", en: "Today" }, scannedBy: scannedBy.name, attendanceHistory: [next, ...item.attendanceHistory] }
          : item,
      );
      return next;
    } catch {
      throw new Error("Invalid QR code");
    }
  },

  async updateProfilePhoto(user: User, photoUri: string): Promise<User> {
    await wait();
    return { ...user, photoUri };
  },
};
