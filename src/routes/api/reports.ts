import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../db";
import { attendanceLogs, members, setNotifications } from "../../db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "../../lib/auth-server";
import { requirePermission } from "../../lib/permissions";
import { writeActivityLog } from "../../lib/audit";
import { FRIDAY_CATEGORIES, FRIDAY_CATEGORY_LABELS, type FridayCategory } from "../../lib/sets";

// GET /api/reports?type=attendance_by_date|attendance_by_category|top_attendees|set_completion|reward_distribution
export const Route = createAPIFileRoute("/api/reports")({
  GET: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser || (tokenUser.role !== "admin" && tokenUser.role !== "super-admin")) {
        return new Response(JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Admins need generate_reports; super-admins bypass.
      if (tokenUser.role === "admin") {
        const permError = await requirePermission(tokenUser.id, "generate_reports");
        if (permError) return permError;
      }

      const url = new URL(request.url);
      const type = url.searchParams.get("type") || "all";

      const result = await buildReports(type);

      await writeActivityLog({
        action: "report_generated",
        textAr: `${tokenUser.name.ar} أنشأ تقريرًا: ${type}`,
        textEn: `${tokenUser.name.en} generated report: ${type}`,
        actorId: tokenUser.id,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message, code: "INTERNAL_ERROR" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

async function buildReports(type: string) {
  const logs = await db.select().from(attendanceLogs);
  const memberList = await db.select().from(members);
  const memberById = new Map(memberList.map((m) => [m.id, m]));

  // Attendance by date (uses createdAt day; falls back to dateEn label).
  const byDateMap = new Map<string, number>();
  for (const l of logs) {
    const day = l.createdAt ? new Date(l.createdAt).toISOString().slice(0, 10) : l.dateEn;
    byDateMap.set(day, (byDateMap.get(day) ?? 0) + 1);
  }
  const attendanceByDate = [...byDateMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Attendance by category.
  const byCatMap = new Map<string, number>();
  for (const l of logs) {
    if (l.fridayCategory) byCatMap.set(l.fridayCategory, (byCatMap.get(l.fridayCategory) ?? 0) + 1);
  }
  const attendanceByCategory = FRIDAY_CATEGORIES.map((category: FridayCategory) => ({
    category,
    label: FRIDAY_CATEGORY_LABELS[category],
    count: byCatMap.get(category) ?? 0,
  }));

  // Top attendees.
  const byMemberMap = new Map<string, number>();
  for (const l of logs) byMemberMap.set(l.memberId, (byMemberMap.get(l.memberId) ?? 0) + 1);
  const topAttendees = [...byMemberMap.entries()]
    .map(([memberId, count]) => {
      const m = memberById.get(memberId);
      return {
        memberId,
        name: m ? { ar: m.nameAr, en: m.nameEn } : { ar: "—", en: "—" },
        phone: m?.phone ?? "",
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Set completion: lifetime completedSets per member + any pending set.
  const sets = await db.select().from(setNotifications);
  const pendingByMember = new Set(sets.filter((s) => s.status === "pending_reward").map((s) => s.memberId));
  const setCompletion = memberList
    .filter((m) => m.role === "member")
    .map((m) => ({
      memberId: m.id,
      name: { ar: m.nameAr, en: m.nameEn },
      phone: m.phone,
      completedSets: m.completedSets,
      pendingReward: pendingByMember.has(m.id),
    }))
    .sort((a, b) => b.completedSets - a.completedSets);

  // Reward distribution: every rewarded set with approver + date.
  const rewardDistribution = sets
    .filter((s) => s.status === "rewarded")
    .map((s) => {
      const m = memberById.get(s.memberId);
      const approver = s.acknowledgedBy ? memberById.get(s.acknowledgedBy) : undefined;
      return {
        setId: s.id,
        setNumber: s.setNumber,
        member: m ? { ar: m.nameAr, en: m.nameEn } : { ar: "—", en: "—" },
        approvedBy: approver ? { ar: approver.nameAr, en: approver.nameEn } : null,
        approvedAt: s.acknowledgedAt,
      };
    })
    .sort((a, b) => (b.approvedAt && a.approvedAt ? new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime() : 0));

  const all = { attendanceByDate, attendanceByCategory, topAttendees, setCompletion, rewardDistribution };

  switch (type) {
    case "attendance_by_date": return { attendanceByDate };
    case "attendance_by_category": return { attendanceByCategory };
    case "top_attendees": return { topAttendees };
    case "set_completion": return { setCompletion };
    case "reward_distribution": return { rewardDistribution };
    default: return all;
  }
}
