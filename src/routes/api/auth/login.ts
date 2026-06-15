import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../db";
import { members } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, generateToken } from "../../../lib/auth-server";

export const Route = createAPIFileRoute("/api/auth/login")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { phone, password, role } = body;

      // Handle demo shortcut if phone is not provided but role is
      let targetPhone = phone;
      if (password === "demo" && role && !phone) {
        if (role === "member" || role === "user") targetPhone = "+20 100 123 4567";
        else if (role === "admin") targetPhone = "+20 100 222 4444";
        else if (role === "super-admin") targetPhone = "+20 100 222 6666";
      }

      if (!targetPhone || !password) {
        return new Response(JSON.stringify({ error: "Phone and password are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Find user by phone
      const user = await db.query.members.findFirst({
        where: eq(members.phone, targetPhone),
      });

      if (!user) {
        return new Response(JSON.stringify({ error: "User not found with this phone number" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Compare password
      const passwordMatch = await comparePassword(password, user.passwordHash);
      if (!passwordMatch) {
        return new Response(JSON.stringify({ error: "Invalid password" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const token = generateToken({
        id: user.id,
        role: user.role,
        name: { ar: user.nameAr, en: user.nameEn },
      });

      const initials = `${user.nameEn.split(" ")[0]?.[0] || ""}${user.nameEn.split(" ")[1]?.[0] || ""}`.toUpperCase();

      const session = {
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
        },
      };

      return new Response(JSON.stringify(session), {
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
