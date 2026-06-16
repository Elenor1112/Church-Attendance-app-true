import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../db";
import { attendanceLogs, members, notifications, setNotifications } from "../../../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { verifyToken } from "../../../lib/auth-server";
import { requirePermission } from "../../../lib/permissions";

const VALID_FRIDAY_CATEGORIES = ["contemporary_issues", "bible_study", "spirituality", "saints_lives"] as const;
type FridayCategory = (typeof VALID_FRIDAY_CATEGORIES)[number];

async function checkAndCreateSetNotification(memberId: string, member: { nameAr: string; nameEn: string }) {
  // Find last acknowledged set notification for this member (or null if none)
  const lastAcknowledged = await db.query.setNotifications.findFirst({
    where: and(
      eq(setNotifications.memberId, memberId),
      eq(setNotifications.acknowledged, true),
    ),
    orderBy: (sn, { desc }) => [desc(sn.acknowledgedAt)],
  });

  // Check if there's already an unacknowledged set notification (max 1 pending)
  const pendingNotification = await db.query.setNotifications.findFirst({
    where: and(
      eq(setNotifications.memberId, memberId),
      eq(setNotifications.acknowledged, false),
    ),
  });
  if (pendingNotification) return;

  // Gather all attendance logs since last acknowledgment
  const allLogs = await db.query.attendanceLogs.findMany({
    where: eq(attendanceLogs.memberId, memberId),
  });

  // Use all logs with a friday category (since last acknowledgment if any)
  // The log ID format scan-{timestamp} lets us derive creation time for new logs;
  // for seeded logs with non-numeric IDs we include them all (safe for fresh installs)
  const cutoffMs = lastAcknowledged?.acknowledgedAt?.getTime() ?? 0;
  const recentLogs = allLogs.filter((l) => {
    if (!l.fridayCategory) return false;
    const numericPart = l.id.replace("scan-", "");
    const ts = Number(numericPart);
    if (isNaN(ts)) return true; // seeded / non-numeric IDs always included
    return ts > cutoffMs;
  });

  const categoriesPresent = new Set(recentLogs.map((l) => l.fridayCategory).filter(Boolean));
  const allFour = VALID_FRIDAY_CATEGORIES.every((c) => categoriesPresent.has(c));
  if (!allFour) return;

  // Create the set notification record
  const setNotifId = `sn-${Date.now()}`;
  await db.insert(setNotifications).values({
    id: setNotifId,
    memberId,
    acknowledged: false,
  });

  // Notify all admins and super-admins
  const admins = await db.query.members.findMany({
    where: and(
      eq(members.status, "approved"),
      inArray(members.role, ["admin", "super-admin"]),
    ),
  });

  for (const admin of admins) {
    await db.insert(notifications).values({
      id: `n-set-${setNotifId}-${admin.id}`,
      titleAr: `🎁 إتمام مجموعة الجمعة`,
      titleEn: `🎁 Friday Set Completed`,
      bodyAr: `${member.nameAr} أكمل مجموعة الجمعة الكاملة! (رمز الإشعار: ${setNotifId})`,
      bodyEn: `${member.nameEn} has completed a full Friday set! (ref: ${setNotifId})`,
      timeAr: "الآن",
      timeEn: "Now",
      unread: true,
      userId: admin.id,
    });
  }
}

export const Route = createAPIFileRoute("/api/attendance")({
  GET: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser) {
        return new Response(JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Admins need view_logs permission (super-admins bypass)
      if (tokenUser.role === "admin") {
        const permError = await requirePermission(tokenUser.id, "view_logs");
        if (permError) return permError;
      }

      const url = new URL(request.url);
      const filter = url.searchParams.get("filter") || "all";
      const search = url.searchParams.get("search") || "";

      const list = await db.select({
        id: attendanceLogs.id,
        memberId: attendanceLogs.memberId,
        time: attendanceLogs.time,
        dateAr: attendanceLogs.dateAr,
        dateEn: attendanceLogs.dateEn,
        status: attendanceLogs.status,
        scannedBy: attendanceLogs.scannedBy,
        fridayCategory: attendanceLogs.fridayCategory,
        nameAr: members.nameAr,
        nameEn: members.nameEn,
      })
      .from(attendanceLogs)
      .innerJoin(members, eq(attendanceLogs.memberId, members.id));

      const filtered = list.filter((item) => {
        const searchOk = !search ||
          item.nameAr.includes(search) ||
          item.nameEn.toLowerCase().includes(search.toLowerCase());
        const filterOk = filter === "all" || (filter === "today" ? item.dateEn === "Today" : true);
        return searchOk && filterOk;
      })
      .map((item) => ({
        id: item.id,
        memberId: item.memberId,
        name: { ar: item.nameAr, en: item.nameEn },
        time: item.time,
        date: { ar: item.dateAr, en: item.dateEn },
        status: item.status,
        scannedBy: item.scannedBy,
        fridayCategory: item.fridayCategory,
      }));

      filtered.sort((a, b) => b.id.localeCompare(a.id));

      return new Response(JSON.stringify(filtered), {
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
  POST: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser || (tokenUser.role !== "admin" && tokenUser.role !== "super-admin")) {
        return new Response(JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Admins need scan permission (super-admins bypass)
      if (tokenUser.role === "admin") {
        const permError = await requirePermission(tokenUser.id, "scan");
        if (permError) return permError;
      }

      const body = await request.json();
      const { payload, fridayCategory } = body;

      if (!payload) {
        return new Response(JSON.stringify({ error: "Payload is required", code: "MISSING_PAYLOAD" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Validate fridayCategory if provided
      if (fridayCategory && !VALID_FRIDAY_CATEGORIES.includes(fridayCategory as FridayCategory)) {
        return new Response(
          JSON.stringify({
            error: "Invalid friday category. Must be one of: contemporary_issues, bible_study, spirituality, saints_lives",
            code: "INVALID_CATEGORY",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      let memberId = "";
      let phone = "";
      try {
        const parsed = JSON.parse(payload);
        memberId = parsed.memberId || "";
        phone = parsed.phone || "";
      } catch {
        if (payload.startsWith("m-")) {
          memberId = payload;
        } else {
          phone = payload;
        }
      }

      let member;
      if (memberId) {
        member = await db.query.members.findFirst({ where: eq(members.id, memberId) });
      } else if (phone) {
        member = await db.query.members.findFirst({ where: eq(members.phone, phone) });
      }

      if (!member) {
        return new Response(JSON.stringify({ error: "Member not found", code: "MEMBER_NOT_FOUND" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (member.status !== "approved") {
        return new Response(
          JSON.stringify({ error: "Member account is not approved yet", code: "MEMBER_NOT_APPROVED" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const logId = `scan-${Date.now()}`;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      await db.insert(attendanceLogs).values({
        id: logId,
        memberId: member.id,
        dateAr: "اليوم",
        dateEn: "Today",
        time: timeStr,
        status: "on-time",
        scannedBy: tokenUser.name.en,
        fridayCategory: fridayCategory || null,
      });

      // Run set-completion check asynchronously (don't block response)
      if (fridayCategory) {
        checkAndCreateSetNotification(member.id, { nameAr: member.nameAr, nameEn: member.nameEn }).catch(() => {});
      }

      return new Response(
        JSON.stringify({
          id: logId,
          memberId: member.id,
          name: { ar: member.nameAr, en: member.nameEn },
          time: timeStr,
          date: { ar: "اليوم", en: "Today" },
          status: "on-time",
          scannedBy: tokenUser.name.en,
          fridayCategory: fridayCategory || null,
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message, code: "INTERNAL_ERROR" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
