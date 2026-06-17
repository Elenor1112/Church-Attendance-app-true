import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../db";
import { notifications, messageReads } from "../../db/schema";
import { eq, and, or, isNull, inArray } from "drizzle-orm";
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

      // User-specific notifications + global announcements.
      const list = await db.select().from(notifications).where(
        or(eq(notifications.userId, tokenUser.id), isNull(notifications.userId))
      );

      // Read receipts for this user (covers globals, which have no per-user unread flag).
      const myReads = await db.select().from(messageReads).where(eq(messageReads.memberId, tokenUser.id));
      const readSet = new Set(myReads.map((r) => r.notificationId));

      const formatted = list.map(item => ({
        id: item.id,
        title: { ar: item.titleAr, en: item.titleEn },
        body: { ar: item.bodyAr, en: item.bodyEn },
        time: { ar: item.timeAr, en: item.timeEn },
        // Targeted rows use the column flag; globals use the per-user read receipt.
        unread: item.userId ? item.unread : !readSet.has(item.id),
      }));

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
        // Clear only the user's own targeted notifications + mark all globals read.
        await db.delete(notifications).where(eq(notifications.userId, tokenUser.id));
        await recordReadsForVisibleGlobals(tokenUser.id);
      } else {
        // Mark as read: flip targeted rows + record read receipts for globals.
        await db.update(notifications)
          .set({ unread: false })
          .where(and(eq(notifications.userId, tokenUser.id), eq(notifications.unread, true)));
        await recordReadsForVisibleGlobals(tokenUser.id);
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

// Insert message_reads rows for every global announcement this member hasn't yet read.
async function recordReadsForVisibleGlobals(memberId: string) {
  const globals = await db.select({ id: notifications.id }).from(notifications).where(isNull(notifications.userId));
  if (globals.length === 0) return;

  const existing = await db
    .select({ notificationId: messageReads.notificationId })
    .from(messageReads)
    .where(and(eq(messageReads.memberId, memberId), inArray(messageReads.notificationId, globals.map((g) => g.id))));
  const already = new Set(existing.map((e) => e.notificationId));

  const toInsert = globals
    .filter((g) => !already.has(g.id))
    .map((g) => ({
      id: `mr-${g.id}-${memberId}`,
      notificationId: g.id,
      memberId,
    }));

  if (toInsert.length > 0) {
    await db.insert(messageReads).values(toInsert).onConflictDoNothing();
  }
}
