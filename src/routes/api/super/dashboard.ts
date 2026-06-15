import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../db";
import { members, attendanceLogs, activityLogs } from "../../../db/schema";
import { eq, or } from "drizzle-orm";
import { verifyToken } from "../../../lib/auth-server";

export const Route = createAPIFileRoute("/api/super/dashboard")({
  GET: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser || tokenUser.role !== "super-admin") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const membersList = await db.query.members.findMany();

      const totalMembers = membersList.filter(m => m.role === "member" && m.status === "approved").length;
      const totalAdmins = membersList.filter(m => m.role === "admin" || m.role === "super-admin").length;
      const pendingApprovals = membersList.filter(m => m.status === "pending").length;

      const logsList = await db.query.attendanceLogs.findMany({
        where: or(eq(attendanceLogs.dateEn, "Today"), eq(attendanceLogs.dateAr, "اليوم")),
      });
      const todayCheckIns = logsList.length;

      const activity = await db.query.activityLogs.findMany({
        limit: 10,
        orderBy: (table, { desc }) => [desc(table.id)],
      });

      const recentAct = activity.map(act => ({
        id: act.id,
        text: { ar: act.textAr, en: act.textEn },
        time: { ar: act.timeAr, en: act.timeEn },
      }));

      return new Response(
        JSON.stringify({
          stats: {
            totalMembers,
            totalAdmins,
            todayCheckIns,
            pendingApprovals,
          },
          recentActivity: recentAct,
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
});
