import { db } from "../db";
import { attendanceLogs, members, notifications, setNotifications } from "../db/schema";
import { and, eq, gte, inArray } from "drizzle-orm";
import { writeActivityLog } from "./audit";

export const FRIDAY_CATEGORIES = [
  "contemporary_issues",
  "bible_study",
  "spirituality",
  "saints_lives",
] as const;

export type FridayCategory = (typeof FRIDAY_CATEGORIES)[number];

export const FRIDAY_CATEGORY_LABELS: Record<FridayCategory, { ar: string; en: string }> = {
  contemporary_issues: { ar: "قضايا معاصرة", en: "Contemporary Issues" },
  bible_study: { ar: "كتاب مقدس", en: "Bible Study" },
  spirituality: { ar: "روحانيات", en: "Spirituality" },
  saints_lives: { ar: "سير قديسين", en: "Saints' Lives" },
};

export function isFridayCategory(value: unknown): value is FridayCategory {
  return typeof value === "string" && (FRIDAY_CATEGORIES as readonly string[]).includes(value);
}

export type CategoryProgress = {
  category: FridayCategory;
  label: { ar: string; en: string };
  done: boolean;
};

export type SetProgress = {
  categories: CategoryProgress[];
  completedInCycle: number; // 0..4
  total: number; // 4
  completedSets: number; // lifetime rewarded/recorded sets count
  pendingReward: boolean; // a completed set is awaiting reward
};

/**
 * Compute a member's Friday-set progress for their CURRENT cycle. Only
 * attendance recorded at/after `cycleStartAt` counts. Attendance history itself
 * is never deleted — cycles are tracked purely via the `cycleStartAt` cursor.
 */
export async function getSetProgress(memberId: string): Promise<SetProgress> {
  const member = await db.query.members.findFirst({ where: eq(members.id, memberId) });
  const cycleStart = member?.cycleStartAt ?? new Date(0);

  const logs = await db
    .select({ fridayCategory: attendanceLogs.fridayCategory })
    .from(attendanceLogs)
    .where(and(eq(attendanceLogs.memberId, memberId), gte(attendanceLogs.createdAt, cycleStart)));

  const present = new Set(logs.map((l) => l.fridayCategory).filter(Boolean) as string[]);

  const categories: CategoryProgress[] = FRIDAY_CATEGORIES.map((category) => ({
    category,
    label: FRIDAY_CATEGORY_LABELS[category],
    done: present.has(category),
  }));

  const pending = await db.query.setNotifications.findFirst({
    where: and(eq(setNotifications.memberId, memberId), eq(setNotifications.status, "pending_reward")),
  });

  return {
    categories,
    completedInCycle: categories.filter((c) => c.done).length,
    total: FRIDAY_CATEGORIES.length,
    completedSets: member?.completedSets ?? 0,
    pendingReward: Boolean(pending),
  };
}

/**
 * Called after each attendance scan. If the member has now covered all 4
 * categories in the current cycle and has no pending set, creates a pending set
 * record, notifies all active admins, and writes an audit entry.
 * Returns the created set's id, or null if no set was created.
 */
export async function detectAndCreateSet(member: {
  id: string;
  nameAr: string;
  nameEn: string;
  phone: string;
}): Promise<string | null> {
  // Don't create a second pending set while one is awaiting reward.
  const pending = await db.query.setNotifications.findFirst({
    where: and(eq(setNotifications.memberId, member.id), eq(setNotifications.status, "pending_reward")),
  });
  if (pending) return null;

  const progress = await getSetProgress(member.id);
  if (progress.completedInCycle < progress.total) return null;

  // Determine next set number for this member.
  const existing = await db.query.setNotifications.findMany({
    where: eq(setNotifications.memberId, member.id),
  });
  const setNumber = existing.length + 1;

  const setId = `set-${Date.now()}`;
  await db.insert(setNotifications).values({
    id: setId,
    memberId: member.id,
    setNumber,
    status: "pending_reward",
    acknowledged: false,
  });

  // Notify all active admins and super-admins.
  const admins = await db.query.members.findMany({
    where: and(eq(members.status, "approved"), eq(members.active, true), inArray(members.role, ["admin", "super-admin"])),
  });

  const completionDate = new Date().toLocaleDateString();
  for (const admin of admins) {
    await db.insert(notifications).values({
      id: `n-${setId}-${admin.id}`,
      titleAr: "🎁 إتمام مجموعة الجمعة",
      titleEn: "🎁 Friday Set Completed",
      bodyAr: `${member.nameAr} (${member.phone}) أكمل مجموعة الجمعة رقم ${setNumber} بتاريخ ${completionDate}.`,
      bodyEn: `${member.nameEn} (${member.phone}) completed Friday set #${setNumber} on ${completionDate}.`,
      timeAr: "الآن",
      timeEn: "Now",
      unread: true,
      userId: admin.id,
    });
  }

  await writeActivityLog({
    action: "set_completed",
    textAr: `${member.nameAr} أكمل مجموعة الجمعة رقم ${setNumber}`,
    textEn: `${member.nameEn} completed Friday set #${setNumber}`,
    targetId: member.id,
  });

  return setId;
}

/**
 * Approve the reward for a completed set. Marks the set rewarded, records the
 * approving admin + timestamp, increments the member's lifetime completedSets,
 * and resets the cycle by advancing `cycleStartAt` so the next set starts fresh.
 * Attendance history is preserved. Returns the affected member or null.
 */
export async function approveReward(setId: string, adminId: string, adminName: { ar: string; en: string }) {
  const set = await db.query.setNotifications.findFirst({ where: eq(setNotifications.id, setId) });
  if (!set) return { error: "NOT_FOUND" as const };
  if (set.status === "rewarded") return { error: "ALREADY_REWARDED" as const };

  const now = new Date();
  await db
    .update(setNotifications)
    .set({ status: "rewarded", acknowledged: true, acknowledgedBy: adminId, acknowledgedAt: now })
    .where(eq(setNotifications.id, setId));

  const member = await db.query.members.findFirst({ where: eq(members.id, set.memberId) });
  if (!member) return { error: "MEMBER_NOT_FOUND" as const };

  // Reset cycle: advance the cursor and increment lifetime count.
  await db
    .update(members)
    .set({ completedSets: member.completedSets + 1, cycleStartAt: now })
    .where(eq(members.id, member.id));

  // Notify the member their reward was approved.
  await db.insert(notifications).values({
    id: `n-reward-${setId}`,
    titleAr: "🎁 تم تسليم المكافأة",
    titleEn: "🎁 Reward Granted",
    bodyAr: `تهانينا! تم تسليم مكافأة مجموعة الجمعة رقم ${set.setNumber}. ابدأ مجموعتك التالية الآن.`,
    bodyEn: `Congratulations! Your reward for Friday set #${set.setNumber} has been granted. Start your next set now.`,
    timeAr: "الآن",
    timeEn: "Now",
    unread: true,
    userId: member.id,
  });

  await writeActivityLog({
    action: "reward_approved",
    textAr: `${adminName.ar} سلّم مكافأة المجموعة رقم ${set.setNumber} لـ ${member.nameAr}`,
    textEn: `${adminName.en} granted set #${set.setNumber} reward to ${member.nameEn}`,
    actorId: adminId,
    targetId: member.id,
  });

  return {
    member: {
      id: member.id,
      name: { ar: member.nameAr, en: member.nameEn },
      completedSets: member.completedSets + 1,
    },
    setNumber: set.setNumber,
  };
}
