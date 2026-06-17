import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../db";
import { adminPermissions, members } from "../../../db/schema";
import { eq, and } from "drizzle-orm";
import { verifyToken } from "../../../lib/auth-server";
import type { Permission } from "../../../lib/permissions";
import { writeActivityLog } from "../../../lib/audit";

const VALID_PERMISSIONS: Permission[] = ["scan", "view_logs", "send_messages", "generate_reports"];

export const Route = createAPIFileRoute("/api/admin/$id/permissions")({
  GET: async ({ request, params }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser || tokenUser.role !== "super-admin") {
        return new Response(JSON.stringify({ error: "Unauthorized. Super admin only.", code: "UNAUTHORIZED" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { id } = params;
      const rows = await db.query.adminPermissions.findMany({
        where: eq(adminPermissions.memberId, id),
      });

      return new Response(
        JSON.stringify({ memberId: id, permissions: rows.map((r) => r.permission) }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message, code: "INTERNAL_ERROR" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  PUT: async ({ request, params }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser || tokenUser.role !== "super-admin") {
        return new Response(JSON.stringify({ error: "Unauthorized. Super admin only.", code: "UNAUTHORIZED" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { id } = params;
      const body = await request.json();
      const permissionsArr: string[] = Array.isArray(body.permissions) ? body.permissions : [];

      const invalidPerms = permissionsArr.filter((p) => !VALID_PERMISSIONS.includes(p as Permission));
      if (invalidPerms.length > 0) {
        return new Response(
          JSON.stringify({ error: `Invalid permissions: ${invalidPerms.join(", ")}`, code: "INVALID_PERMISSIONS" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const targetMember = await db.query.members.findFirst({ where: eq(members.id, id) });
      if (!targetMember || targetMember.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Admin member not found", code: "NOT_FOUND" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      // Replace: delete existing then insert new set
      await db.delete(adminPermissions).where(eq(adminPermissions.memberId, id));

      if (permissionsArr.length > 0) {
        await db.insert(adminPermissions).values(
          permissionsArr.map((perm) => ({
            id: `perm-${id}-${perm}-${Date.now()}`,
            memberId: id,
            permission: perm,
            grantedBy: tokenUser.id,
          })),
        );
      }

      const updated = await db.query.adminPermissions.findMany({
        where: eq(adminPermissions.memberId, id),
      });

      await writeActivityLog({
        action: "permissions_changed",
        textAr: `${tokenUser.name.ar} حدّث صلاحيات ${targetMember.nameAr}: ${permissionsArr.join("، ") || "لا شيء"}`,
        textEn: `${tokenUser.name.en} updated permissions for ${targetMember.nameEn}: ${permissionsArr.join(", ") || "none"}`,
        actorId: tokenUser.id,
        targetId: id,
      });

      return new Response(
        JSON.stringify({ memberId: id, permissions: updated.map((r) => r.permission) }),
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
