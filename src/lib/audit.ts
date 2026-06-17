import { db } from "../db";
import { activityLogs } from "../db/schema";

export type AuditAction =
  | "attendance_scan"
  | "set_completed"
  | "reward_approved"
  | "admin_created"
  | "permissions_changed"
  | "message_sent"
  | "report_generated"
  | "member_status_changed"
  | "admin_deactivated"
  | "admin_reactivated";

type AuditInput = {
  action: AuditAction;
  textAr: string;
  textEn: string;
  actorId?: string | null;
  targetId?: string | null;
};

/**
 * Append a row to the activity_logs audit trail. Every mutating action in the
 * system should call this. Failures are swallowed so audit logging never breaks
 * the primary operation, but they are logged to the server console.
 */
export async function writeActivityLog(input: AuditInput): Promise<void> {
  try {
    const now = new Date();
    await db.insert(activityLogs).values({
      id: `act-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      textAr: input.textAr.slice(0, 255),
      textEn: input.textEn.slice(0, 255),
      timeAr: "الآن",
      timeEn: "Now",
      action: input.action,
      actorId: input.actorId ?? null,
      targetId: input.targetId ?? null,
      createdAt: now,
    });
  } catch (err) {
    console.error("[audit] failed to write activity log:", err);
  }
}
