import { createAPIFileRoute } from "@tanstack/react-start/api";
import { verifyToken } from "../../../lib/auth-server";
import { approveReward } from "../../../lib/sets";

// PATCH /api/set-notifications/:id/acknowledge
// Admin marks a completed Friday set as "reward given". This rewards the set,
// records the approving admin + timestamp, increments lifetime completedSets,
// and resets the member's cycle so they start collecting the next set.
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

      const result = await approveReward(params.id, tokenUser.id, tokenUser.name);

      if ("error" in result) {
        const status = result.error === "ALREADY_REWARDED" ? 400 : 404;
        return new Response(JSON.stringify({ error: result.error, code: result.error }), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          id: params.id,
          memberId: result.member.id,
          memberName: result.member.name,
          completedSets: result.member.completedSets,
          setNumber: result.setNumber,
          status: "rewarded",
          acknowledged: true,
          acknowledgedBy: tokenUser.id,
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
