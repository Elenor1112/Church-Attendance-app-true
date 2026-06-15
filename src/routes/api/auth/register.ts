import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../db";
import { members } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../../../lib/auth-server";

export const Route = createAPIFileRoute("/api/auth/register")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { firstName, lastName, phone, email, birthday, spousePhone, password } = body;

      if (!firstName || !lastName || !phone || !password) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Check if phone already exists
      const existingUser = await db.query.members.findFirst({
        where: eq(members.phone, phone),
      });

      if (existingUser) {
        return new Response(JSON.stringify({ error: "A member with this phone number already exists" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const passwordHash = await hashPassword(password);
      const memberId = `m-${Date.now()}`;
      const name = `${firstName} ${lastName}`;

      await db.insert(members).values({
        id: memberId,
        phone,
        nameAr: name, // Set both English and Arabic to the same for now, or split if needed
        nameEn: name,
        email: email || null,
        birthday: birthday || null,
        spousePhone: spousePhone || null,
        passwordHash,
        role: "member",
        status: "pending",
        registered: new Date().toISOString().slice(0, 10),
        approvedBy: null,
        photoUri: null,
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 201,
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
