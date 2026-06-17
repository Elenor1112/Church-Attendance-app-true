import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../db";
import { members } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, generateToken } from "../../../lib/auth-server";
import { getAdminPermissions } from "../../../lib/permissions";

export const Route = createAPIFileRoute("/api/auth/login")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { phone, password } = body;

      if (!phone || !password) {
        return new Response(JSON.stringify({ error: "Phone and password are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const user = await db.query.members.findFirst({ where: eq(members.phone, phone) });
      if (!user) {
        return new Response(JSON.stringify({ error: "Invalid phone or password" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const passwordMatch = await comparePassword(password, user.passwordHash);
      if (!passwordMatch) {
        return new Response(JSON.stringify({ error: "Invalid phone or password" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!user.active) {
        return new Response(JSON.stringify({ error: "This account has been deactivated", code: "DEACTIVATED" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Load granular permissions for admins; super-admins implicitly have all.
      const ALL_PERMISSIONS = ["scan", "view_logs", "send_messages", "generate_reports"];
      const permissions =
        user.role === "super-admin"
          ? ALL_PERMISSIONS
          : user.role === "admin"
            ? await getAdminPermissions(user.id)
            : [];

      const token = generateToken({ id: user.id, role: user.role, name: { ar: user.nameAr, en: user.nameEn } });
      const initials = `${user.nameEn.split(" ")[0]?.[0] || ""}${user.nameEn.split(" ")[1]?.[0] || ""}`.toUpperCase();

      return new Response(
        JSON.stringify({
          accessToken: token,
          refreshToken: `refresh-${user.id}`,
          user: {
            id: user.id,
            phone: user.phone,
            name: { ar: user.nameAr, en: user.nameEn },
            initials: initials || "MA",
            email: user.email || undefined,
            birthday: user.birthday || undefined,
            role: user.role,
            status: user.status,
            photoUri: user.photoUri || undefined,
            permissions,
            completedSets: user.completedSets,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
