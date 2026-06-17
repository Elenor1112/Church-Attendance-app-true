import { API_URL } from "@/lib/config";
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
  SetNotification,
  User,
} from "@/types";

// ---------------------------------------------------------------------------
// Real HTTP API client. Talks to the TanStack Start backend (see API_URL).
// The access token is held in module scope and injected by the auth provider
// via setAuthToken() so every authenticated request carries the Bearer token.
// ---------------------------------------------------------------------------

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export type SetProgressResponse = {
  categories: { category: string; label: { ar: string; en: string }; done: boolean }[];
  completedInCycle: number;
  total: number;
  completedSets: number;
  pendingReward: boolean;
};

export const api = {
  async login(input: LoginInput): Promise<Session> {
    return request<Session>("/api/auth/login", {
      method: "POST",
      auth: false,
      body: { phone: input.phone, password: input.password },
    });
  },

  async register(input: RegisterInput): Promise<{ ok: true }> {
    await request("/api/auth/register", {
      method: "POST",
      auth: false,
      body: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        password: input.password,
        email: input.email || undefined,
        birthday: input.birthday,
        spousePhone: input.spousePhone || undefined,
      },
    });
    return { ok: true };
  },

  async me(session: Session): Promise<User> {
    return request<User>("/api/auth/me");
  },

  async memberHome() {
    return request<{
      verse: { ar: string; en: string; ref: { ar: string; en: string } };
      meeting: {
        title: { ar: string; en: string };
        date: { ar: string; en: string };
        time: { ar: string; en: string };
        location: { ar: string; en: string };
      };
      visitsThisMonth: number;
      unreadAnnouncements: number;
    }>("/api/member/home");
  },

  async setProgress(memberId?: string): Promise<SetProgressResponse> {
    const qs = memberId ? `?memberId=${encodeURIComponent(memberId)}` : "";
    return request<SetProgressResponse>(`/api/member/progress${qs}`);
  },

  async notifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>("/api/notifications");
  },

  async clearNotifications(): Promise<NotificationItem[]> {
    await request("/api/notifications", { method: "POST", body: { action: "clear" } });
    return request<NotificationItem[]>("/api/notifications");
  },

  async markNotificationsRead(): Promise<void> {
    await request("/api/notifications", { method: "POST", body: { action: "read" } });
  },

  async attendanceLogs(filter: "today" | "thisWeek" | "all", search = ""): Promise<AttendanceLog[]> {
    const params = new URLSearchParams({ filter, search });
    return request<AttendanceLog[]>(`/api/attendance?${params.toString()}`);
  },

  async adminComms() {
    return request<{
      birthdays: { id: string; name: { ar: string; en: string }; date: { ar: string; en: string }; days: number }[];
      receipts: { id: string; title: { ar: string; en: string }; delivered: number; read: number }[];
      absences: { id: string; name: { ar: string; en: string }; last: { ar: string; en: string }; streak: number }[];
      approvedMembers: { id: string; name: { ar: string; en: string }; phone: string }[];
    }>("/api/admin/comms");
  },

  async sendAlert(input: SendAlertInput) {
    return request<{ delivered: number }>("/api/admin/comms", {
      method: "POST",
      body: { type: input.type, message: input.message, recipientIds: input.recipientIds },
    });
  },

  async pendingMembers(): Promise<MemberRecord[]> {
    return request<MemberRecord[]>("/api/admin/members?status=pending");
  },

  async updateMemberStatus(id: string, status: MemberStatus) {
    return request("/api/admin/members", {
      method: "POST",
      body: { action: "update-status", id, status },
    });
  },

  async createMember(input: ManualMemberInput) {
    return request("/api/admin/members", {
      method: "POST",
      body: {
        action: "create",
        nameEn: `${input.firstName} ${input.lastName}`.trim(),
        nameAr: `${input.firstName} ${input.lastName}`.trim(),
        phone: input.phone,
        email: input.email || undefined,
        birthday: input.birthday,
        spousePhone: input.spousePhone || undefined,
        role: input.role,
        password: input.password,
      },
    });
  },

  async members(role: Role | "all", status: MemberStatus | "all", search = ""): Promise<MemberRecord[]> {
    const params = new URLSearchParams({ role, status, search });
    return request<MemberRecord[]>(`/api/admin/members?${params.toString()}`);
  },

  async dashboard() {
    return request<{
      stats: { totalMembers: number; totalAdmins: number; todayCheckIns: number; pendingApprovals: number };
      recentActivity: { id: string; text: { ar: string; en: string }; time: { ar: string; en: string } }[];
    }>("/api/super/dashboard");
  },

  async reports(type = "all") {
    return request<any>(`/api/reports?type=${encodeURIComponent(type)}`);
  },

  async recordAttendance(payloadText: string, _scannedBy: User, fridayCategory?: string): Promise<AttendanceLog & { setCompleted?: boolean }> {
    return request<AttendanceLog & { setCompleted?: boolean }>("/api/attendance", {
      method: "POST",
      body: { payload: payloadText, fridayCategory },
    });
  },

  async updateProfilePhoto(user: User, photoUri: string): Promise<User> {
    // Profile photo persistence is handled client-side via session for now;
    // the backend exposes no photo endpoint. Return the updated user.
    return { ...user, photoUri };
  },

  async setNotifications(): Promise<SetNotification[]> {
    return request<SetNotification[]>("/api/set-notifications?acknowledged=false");
  },

  async acknowledgeSetNotification(id: string): Promise<void> {
    await request(`/api/set-notifications/${id}/acknowledge`, { method: "PATCH" });
  },
};
