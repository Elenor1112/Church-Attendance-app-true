import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../db";
import { setNotifications, members } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { verifyToken } from "../../lib/auth-server";

export const Route = createAPIFileRoute("/api/set-notifications")({
  GET: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser || (tokenUser.role !== "admin" && tokenUser.role !== "super-admin")) {
        return new Response(JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const url = new URL(request.url);
      const acknowledgedParam = url.searchParams.get("acknowledged");

      let query;
      if (acknowledgedParam === "false") {
        query = db.query.setNotifications.findMany({
          where: eq(setNotifications.acknowledged, false),
        });
      } else if (acknowledgedParam === "true") {
        query = db.query.setNotifications.findMany({
          where: eq(setNotifications.acknowledged, true),
        });
      } else {
        query = db.query.setNotifications.findMany();
      }

      const rows = await query;

      // Enrich with member details
      const enriched = await Promise.all(
        rows.map(async (row) => {
          const member = await db.query.members.findFirst({
            where: eq(members.id, row.memberId),
          });
          return {
            id: row.id,
            memberId: row.memberId,
            memberName: member ? { ar: member.nameAr, en: member.nameEn } : { ar: "—", en: "—" },
            completedSets: member?.completedSets ?? 0,
            triggeredAt: row.triggeredAt,
            acknowledged: row.acknowledged,
            acknowledgedBy: row.acknowledgedBy,
            acknowledgedAt: row.acknowledgedAt,
          };
        }),
      );

      // Sort newest first
      enriched.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());

      return new Response(JSON.stringify(enriched), {
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
