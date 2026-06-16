import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../db";
import { setNotifications, members } from "../../../db/schema";
import { eq, sql } from "drizzle-orm";
import { verifyToken } from "../../../lib/auth-server";

export const Route = createAPIFileRoute("/api/set-notifications/$id/acknowledge")({
  PATCH: async ({ request, params }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser || (tokenUser.role !== "admin" && tokenUser.role !== "super-admin")) {
        return new Response(JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { id } = params;

      const existing = await db.query.setNotifications.findFirst({
        where: eq(setNotifications.id, id),
      });

      if (!existing) {
        return new Response(JSON.stringify({ error: "Set notification not found", code: "NOT_FOUND" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (existing.acknowledged) {
        return new Response(
          JSON.stringify({ error: "Already acknowledged", code: "ALREADY_ACKNOWLEDGED" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const now = new Date();
      await db
        .update(setNotifications)
        .set({
          acknowledged: true,
          acknowledgedBy: tokenUser.id,
          acknowledgedAt: now,
        })
        .where(eq(setNotifications.id, id));

      // Increment completed_sets for the member
      await db
        .update(members)
        .set({ completedSets: sql`${members.completedSets} + 1` })
        .where(eq(members.id, existing.memberId));

      const updatedMember = await db.query.members.findFirst({
        where: eq(members.id, existing.memberId),
      });

      return new Response(
        JSON.stringify({
          id: existing.id,
          memberId: existing.memberId,
          memberName: updatedMember ? { ar: updatedMember.nameAr, en: updatedMember.nameEn } : null,
          completedSets: updatedMember?.completedSets ?? 0,
          acknowledged: true,
          acknowledgedBy: tokenUser.id,
          acknowledgedAt: now,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message, code: "INTERNAL_ERROR" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
