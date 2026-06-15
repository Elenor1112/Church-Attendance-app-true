import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../db";
import { notifications } from "../../db/schema";
import { eq, and, or, isNull } from "drizzle-orm";
import { verifyToken } from "../../lib/auth-server";

export const Route = createAPIFileRoute("/api/notifications")({
  GET: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Fetch user specific and global notifications
      const list = await db.select().from(notifications).where(
        or(eq(notifications.userId, tokenUser.id), isNull(notifications.userId))
      );

      const formatted = list.map(item => ({
        id: item.id,
        title: { ar: item.titleAr, en: item.titleEn },
        body: { ar: item.bodyAr, en: item.bodyEn },
        time: { ar: item.timeAr, en: item.timeEn },
        unread: item.unread,
      }));

      // Sort by id descending (newest first)
      formatted.sort((a, b) => b.id.localeCompare(a.id));

      return new Response(JSON.stringify(formatted), {
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
      if (!tokenUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const body = await request.json().catch(() => ({}));
      const { action } = body;

      if (action === "clear") {
        // Delete user notifications
        await db.delete(notifications).where(eq(notifications.userId, tokenUser.id));
      } else {
        // Mark as read
        await db.update(notifications)
          .set({ unread: false })
          .where(and(eq(notifications.userId, tokenUser.id), eq(notifications.unread, true)));
      }

      return new Response(JSON.stringify({ success: true }), {
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
});
