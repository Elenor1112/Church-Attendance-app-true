import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../db";
import { members } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "../../../lib/auth-server";

export const Route = createAPIFileRoute("/api/auth/me")({
  GET: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Fetch user from DB
      const user = await db.query.members.findFirst({
        where: eq(members.id, tokenUser.id),
      });

      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const initials = `${user.nameEn.split(" ")[0]?.[0] || ""}${user.nameEn.split(" ")[1]?.[0] || ""}`.toUpperCase();

      return new Response(
        JSON.stringify({
          id: user.id,
          phone: user.phone,
          name: { ar: user.nameAr, en: user.nameEn },
          initials: initials || "MA",
          email: user.email || undefined,
          birthday: user.birthday || undefined,
          role: user.role,
          status: user.status,
          photoUri: user.photoUri || undefined,
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
