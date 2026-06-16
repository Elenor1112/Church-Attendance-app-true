import { db } from "../db";
import { adminPermissions } from "../db/schema";
import { and, eq } from "drizzle-orm";

export type Permission = "scan" | "view_logs" | "send_messages" | "generate_reports";

export const PERMISSION_LABELS: Record<Permission, { ar: string; en: string }> = {
  scan: { ar: "مسح QR", en: "Scan QR Codes" },
  view_logs: { ar: "عرض السجلات", en: "View Attendance Logs" },
  send_messages: { ar: "إرسال رسائل للأعضاء", en: "Send Messages to Members" },
  generate_reports: { ar: "إنشاء تقارير", en: "Generate Reports" },
};

export async function getAdminPermissions(memberId: string): Promise<Permission[]> {
  const rows = await db.query.adminPermissions.findMany({
    where: eq(adminPermissions.memberId, memberId),
  });
  return rows.map((r) => r.permission as Permission);
}

export async function hasPermission(memberId: string, permission: Permission): Promise<boolean> {
  const row = await db.query.adminPermissions.findFirst({
    where: and(
      eq(adminPermissions.memberId, memberId),
      eq(adminPermissions.permission, permission),
    ),
  });
  return row !== undefined;
}

export async function requirePermission(memberId: string, permission: Permission): Promise<Response | null> {
  const granted = await hasPermission(memberId, permission);
  if (!granted) {
    return new Response(
      JSON.stringify({
        error: `Permission denied. Required: ${permission}`,
        code: "PERMISSION_DENIED",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }
  return null;
}
