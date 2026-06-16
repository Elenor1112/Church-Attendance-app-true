import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../db";
import { members, adminPermissions } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { verifyToken, hashPassword } from "../../../lib/auth-server";
import type { Permission } from "../../../lib/permissions";

const VALID_PERMISSIONS: Permission[] = ["scan", "view_logs", "send_messages", "generate_reports"];

export const Route = createAPIFileRoute("/api/admin/create")({
  POST: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser || tokenUser.role !== "super-admin") {
        return new Response(JSON.stringify({ error: "Unauthorized. Super admin only.", code: "UNAUTHORIZED" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const body = await request.json();
      const { nameEn, nameAr, phone, password, permissions } = body;

      if (!nameEn || !nameAr || !phone || !password) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: nameEn, nameAr, phone, password", code: "MISSING_FIELDS" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const permissionsArr: string[] = Array.isArray(permissions) ? permissions : [];
      const invalidPerms = permissionsArr.filter((p) => !VALID_PERMISSIONS.includes(p as Permission));
      if (invalidPerms.length > 0) {
        return new Response(
          JSON.stringify({ error: `Invalid permissions: ${invalidPerms.join(", ")}`, code: "INVALID_PERMISSIONS" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const existing = await db.query.members.findFirst({ where: eq(members.phone, phone) });
      if (existing) {
        return new Response(
          JSON.stringify({ error: "Phone number already in use", code: "PHONE_TAKEN" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const memberId = `m-${Date.now()}`;
      const passwordHash = await hashPassword(password);

      await db.insert(members).values({
        id: memberId,
        phone,
        nameAr,
        nameEn,
        passwordHash,
        role: "admin",
        status: "approved",
        registered: new Date().toISOString().slice(0, 10),
        approvedBy: tokenUser.name.en,
        completedSets: 0,
      });

      if (permissionsArr.length > 0) {
        await db.insert(adminPermissions).values(
          permissionsArr.map((perm) => ({
            id: `perm-${memberId}-${perm}`,
            memberId,
            permission: perm,
            grantedBy: tokenUser.id,
          })),
        );
      }

      const created = await db.query.members.findFirst({ where: eq(members.id, memberId) });
      const createdPerms = await db.query.adminPermissions.findMany({
        where: eq(adminPermissions.memberId, memberId),
      });

      return new Response(
        JSON.stringify({
          ...created,
          permissions: createdPerms.map((p) => p.permission),
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message, code: "INTERNAL_ERROR" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
