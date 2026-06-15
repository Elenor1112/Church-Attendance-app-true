import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../db";
import { attendanceLogs, members } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "../../../lib/auth-server";

export const Route = createAPIFileRoute("/api/attendance")({
  GET: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
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
        nameAr: members.nameAr,
        nameEn: members.nameEn,
      })
      .from(attendanceLogs)
      .innerJoin(members, eq(attendanceLogs.memberId, members.id));

      const filtered = list.filter(item => {
        const searchOk = !search ||
          item.nameAr.includes(search) ||
          item.nameEn.toLowerCase().includes(search.toLowerCase());

        const filterOk = filter === "all" || (filter === "today" ? item.dateEn === "Today" : true);

        return searchOk && filterOk;
      })
      .map(item => ({
        id: item.id,
        memberId: item.memberId,
        name: { ar: item.nameAr, en: item.nameEn },
        time: item.time,
        date: { ar: item.dateAr, en: item.dateEn },
        status: item.status,
        scannedBy: item.scannedBy,
      }));

      // Sort newest first
      filtered.sort((a, b) => b.id.localeCompare(a.id));

      return new Response(JSON.stringify(filtered), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
  POST: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser || (tokenUser.role !== "admin" && tokenUser.role !== "super-admin")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const body = await request.json();
      const { payload } = body;

      if (!payload) {
        return new Response(JSON.stringify({ error: "Payload is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
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
        member = await db.query.members.findFirst({
          where: eq(members.id, memberId),
        });
      } else if (phone) {
        member = await db.query.members.findFirst({
          where: eq(members.phone, phone),
        });
      }

      if (!member) {
        return new Response(JSON.stringify({ error: "Member not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (member.status !== "approved") {
        return new Response(JSON.stringify({ error: "Member account is not approved yet" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
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
      });

      return new Response(
        JSON.stringify({
          id: logId,
          memberId: member.id,
          name: { ar: member.nameAr, en: member.nameEn },
          time: timeStr,
          date: { ar: "اليوم", en: "Today" },
          status: "on-time",
          scannedBy: tokenUser.name.en,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
