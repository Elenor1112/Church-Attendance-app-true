import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../db";
import { members, notifications, attendanceLogs } from "../../../db/schema";
import { eq, isNull, or } from "drizzle-orm";
import { verifyToken } from "../../../lib/auth-server";
import { requirePermission } from "../../../lib/permissions";

export const Route = createAPIFileRoute("/api/admin/comms")({
  GET: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser || (tokenUser.role !== "admin" && tokenUser.role !== "super-admin")) {
        return new Response(JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const allApproved = await db.query.members.findMany({
        where: eq(members.status, "approved"),
      });

      const currentMonth = new Date().getMonth() + 1;

      const upcomingBdays = allApproved
        .filter(m => m.birthday)
        .map(m => {
          const [year, monthStr, dayStr] = m.birthday!.split("-");
          const month = parseInt(monthStr || "0", 10);
          const day = parseInt(dayStr || "0", 10);
          return { member: m, month, day };
        })
        .filter(item => {
          return item.month === currentMonth || item.month === (currentMonth % 12) + 1;
        })
        .map(item => {
          const name = { ar: item.member.nameAr, en: item.member.nameEn };
          const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          const monthsAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
          const dateStrEn = `${months[item.month - 1]} ${item.day}`;
          const dateStrAr = `${item.day} ${monthsAr[item.month - 1]}`;

          const now = new Date();
          const bdayDate = new Date(now.getFullYear(), item.month - 1, item.day);
          if (bdayDate.getTime() < now.getTime()) {
            bdayDate.setFullYear(now.getFullYear() + 1);
          }
          const diffTime = Math.abs(bdayDate.getTime() - now.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return {
            id: item.member.id,
            name,
            date: { ar: dateStrAr, en: dateStrEn },
            days: diffDays,
          };
        });

      upcomingBdays.sort((a, b) => a.days - b.days);

      const announcements = await db.select().from(notifications).where(isNull(notifications.userId));
      const receipts = announcements.map(ann => {
        return {
          id: ann.id,
          title: { ar: ann.titleAr, en: ann.titleEn },
          delivered: allApproved.length,
          read: Math.floor(allApproved.length * 0.7),
        };
      });

      const todayLogs = await db.select().from(attendanceLogs).where(
        or(eq(attendanceLogs.dateEn, "Today"), eq(attendanceLogs.dateAr, "اليوم"))
      );
      const todayMemberIds = new Set(todayLogs.map(l => l.memberId));

      const absences = allApproved
        .filter(m => m.role === "member" && !todayMemberIds.has(m.id))
        .slice(0, 3)
        .map(m => {
          return {
            id: m.id,
            name: { ar: m.nameAr, en: m.nameEn },
            last: { ar: "٢٣ مايو", en: "May 23" },
            streak: 3,
          };
        });

      return new Response(
        JSON.stringify({
          birthdays: upcomingBdays.slice(0, 5),
          receipts,
          absences,
          approvedMembers: allApproved.map(m => ({
            id: m.id,
            name: { ar: m.nameAr, en: m.nameEn },
            phone: m.phone,
          })),
        }),
        {
          status: 200,
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
  POST: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser || (tokenUser.role !== "admin" && tokenUser.role !== "super-admin")) {
        return new Response(JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (tokenUser.role === "admin") {
        const permError = await requirePermission(tokenUser.id, "send_messages");
        if (permError) return permError;
      }

      const body = await request.json();
      const { type, message, titleAr, titleEn, bodyAr, bodyEn, recipientIds } = body;

      if ((!message && !bodyAr && !bodyEn) || !recipientIds || !Array.isArray(recipientIds)) {
        return new Response(JSON.stringify({ error: "Missing alert data", code: "MISSING_DATA" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const finalTitleAr = titleAr || (type === "standard" ? "إشعار جديد" : "رسالة مخصصة");
      const finalTitleEn = titleEn || (type === "standard" ? "New alert" : "Custom message");
      const finalBodyAr = bodyAr || message || "";
      const finalBodyEn = bodyEn || message || "";
      const notificationId = `n-${Date.now()}`;

      if (recipientIds.length === 0 || (recipientIds.length === 1 && recipientIds[0] === "all")) {
        await db.insert(notifications).values({
          id: notificationId,
          titleAr: finalTitleAr,
          titleEn: finalTitleEn,
          bodyAr: finalBodyAr,
          bodyEn: finalBodyEn,
          timeAr: "الآن",
          timeEn: "Now",
          unread: true,
          userId: null,
        });
      } else {
        for (const recipientId of recipientIds) {
          await db.insert(notifications).values({
            id: `${notificationId}-${recipientId}`,
            titleAr: finalTitleAr,
            titleEn: finalTitleEn,
            bodyAr: finalBodyAr,
            bodyEn: finalBodyEn,
            timeAr: "الآن",
            timeEn: "Now",
            unread: true,
            userId: recipientId,
          });
        }
      }

      return new Response(
        JSON.stringify({ delivered: recipientIds.length || 1 }),
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
