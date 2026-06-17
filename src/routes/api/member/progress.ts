import { createAPIFileRoute } from "@tanstack/react-start/api";
import { verifyToken } from "../../../lib/auth-server";
import { getSetProgress } from "../../../lib/sets";

// GET /api/member/progress  — current member's Friday-set progress (3/4 etc.)
// GET /api/member/progress?memberId=...  — admins may inspect any member.
export const Route = createAPIFileRoute("/api/member/progress")({
  GET: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser) {
        return new Response(JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const url = new URL(request.url);
      const requested = url.searchParams.get("memberId");

      // Members may only view their own progress; admins/super-admins may view anyone.
      let targetId = tokenUser.id;
      if (requested && requested !== tokenUser.id) {
        if (tokenUser.role !== "admin" && tokenUser.role !== "super-admin") {
          return new Response(JSON.stringify({ error: "Forbidden", code: "FORBIDDEN" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }
        targetId = requested;
      }

      const progress = await getSetProgress(targetId);

      return new Response(JSON.stringify(progress), {
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
