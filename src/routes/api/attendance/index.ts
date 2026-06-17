import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../db";
import { attendanceLogs, members } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "../../../lib/auth-server";
import { requirePermission } from "../../../lib/permissions";
import { isFridayCategory, detectAndCreateSet, FRIDAY_CATEGORIES } from "../../../lib/sets";
import { writeActivityLog } from "../../../lib/audit";

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

      // A Friday category is mandatory: the scanner must select one before recording.
      if (!fridayCategory || !isFridayCategory(fridayCategory)) {
        return new Response(
          JSON.stringify({
            error: `A Friday category is required. Must be one of: ${FRIDAY_CATEGORIES.join(", ")}`,
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
        scannedByAdminId: tokenUser.id,
        fridayCategory,
        createdAt: now,
      });

      await writeActivityLog({
        action: "attendance_scan",
        textAr: `تم تسجيل حضور ${member.nameAr}`,
        textEn: `Recorded attendance for ${member.nameEn}`,
        actorId: tokenUser.id,
        targetId: member.id,
      });

      // Detect set completion (creates pending set + notifies admins). Awaited so
      // the response can report whether a set was just completed.
      const setId = await detectAndCreateSet({
        id: member.id,
        nameAr: member.nameAr,
        nameEn: member.nameEn,
        phone: member.phone,
      }).catch(() => null);

      return new Response(
        JSON.stringify({
          id: logId,
          memberId: member.id,
          name: { ar: member.nameAr, en: member.nameEn },
          time: timeStr,
          date: { ar: "اليوم", en: "Today" },
          status: "on-time",
          scannedBy: tokenUser.name.en,
          fridayCategory,
          setCompleted: Boolean(setId),
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
