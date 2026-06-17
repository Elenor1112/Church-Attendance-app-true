import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../db";
import { members, attendanceLogs } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken, hashPassword } from "../../../lib/auth-server";
import { writeActivityLog } from "../../../lib/audit";

export const Route = createAPIFileRoute("/api/admin/members")({
  GET: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser || (tokenUser.role !== "admin" && tokenUser.role !== "super-admin")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const url = new URL(request.url);
      const roleFilter = url.searchParams.get("role") || "all";
      const statusFilter = url.searchParams.get("status") || "all";
      const search = url.searchParams.get("search") || "";

      const list = await db.query.members.findMany();

      const formatted = [];
      for (const m of list) {
        const lastLog = await db.query.attendanceLogs.findFirst({
          where: eq(attendanceLogs.memberId, m.id),
          orderBy: desc(attendanceLogs.id),
        });

        formatted.push({
          id: m.id,
          name: { ar: m.nameAr, en: m.nameEn },
          phone: m.phone,
          email: m.email || undefined,
          birthday: m.birthday || undefined,
          spousePhone: m.spousePhone || undefined,
          role: m.role,
          status: m.status,
          active: m.active,
          completedSets: m.completedSets,
          registered: m.registered,
          approvedBy: m.approvedBy ? { ar: m.approvedBy, en: m.approvedBy } : null,
          lastAttendance: lastLog ? { ar: lastLog.dateAr, en: lastLog.dateEn } : null,
          scannedBy: lastLog ? { ar: lastLog.scannedBy, en: lastLog.scannedBy } : null,
        });
      }

      const filtered = formatted.filter(m => {
        const roleOk = roleFilter === "all" || m.role === roleFilter;
        const statusOk = statusFilter === "all" || m.status === statusFilter;

        const searchOk = !search ||
          m.name.ar.includes(search) ||
          m.name.en.toLowerCase().includes(search.toLowerCase()) ||
          m.phone.includes(search);

        return roleOk && statusOk && searchOk;
      });

      return new Response(JSON.stringify(filtered), {
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
  POST: async ({ request }) => {
    try {
      const tokenUser = verifyToken(request);
      if (!tokenUser || (tokenUser.role !== "admin" && tokenUser.role !== "super-admin")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const body = await request.json();
      const { action, id, status, nameAr, nameEn, phone, email, birthday, spousePhone, role, password } = body;

      if (action === "update-status") {
        if (!id || !status) {
          return new Response(JSON.stringify({ error: "Missing fields for status update" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        await db.update(members)
          .set({
            status,
            approvedBy: status === "approved" ? tokenUser.name.en : null,
          })
          .where(eq(members.id, id));

        const updated = await db.query.members.findFirst({
          where: eq(members.id, id),
        });

        await writeActivityLog({
          action: "member_status_changed",
          textAr: `${tokenUser.name.ar} غيّر حالة ${updated?.nameAr ?? id} إلى ${status}`,
          textEn: `${tokenUser.name.en} set ${updated?.nameEn ?? id} status to ${status}`,
          actorId: tokenUser.id,
          targetId: id,
        });

        return new Response(JSON.stringify(updated), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (action === "create") {
        if (!nameAr || !nameEn || !phone || !role || !password) {
          return new Response(JSON.stringify({ error: "Missing required fields (name, phone, role, password)" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const existing = await db.query.members.findFirst({
          where: eq(members.phone, phone),
        });
        if (existing) {
          return new Response(JSON.stringify({ error: "Member phone number already exists" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const memberId = `m-${Date.now()}`;
        const passwordHash = await hashPassword(password);

        await db.insert(members).values({
          id: memberId,
          phone,
          nameAr,
          nameEn,
          email: email || null,
          birthday: birthday || null,
          spousePhone: spousePhone || null,
          passwordHash,
          role,
          status: "approved",
          registered: new Date().toISOString().slice(0, 10),
          approvedBy: tokenUser.name.en,
          photoUri: null,
        });

        await writeActivityLog({
          action: "member_status_changed",
          textAr: `${tokenUser.name.ar} أنشأ عضوًا: ${nameAr}`,
          textEn: `${tokenUser.name.en} created member: ${nameEn}`,
          actorId: tokenUser.id,
          targetId: memberId,
        });

        const created = await db.query.members.findFirst({
          where: eq(members.id, memberId),
        });
        return new Response(JSON.stringify(created), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }

      // --- Super-admin only: edit / deactivate / reactivate an admin account ---
      if (action === "update-admin" || action === "deactivate" || action === "reactivate") {
        if (tokenUser.role !== "super-admin") {
          return new Response(JSON.stringify({ error: "Super admin only", code: "UNAUTHORIZED" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (!id) {
          return new Response(JSON.stringify({ error: "Missing member id" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const target = await db.query.members.findFirst({ where: eq(members.id, id) });
        if (!target) {
          return new Response(JSON.stringify({ error: "Member not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (action === "update-admin") {
          const updates: Record<string, unknown> = {};
          if (nameAr) updates.nameAr = nameAr;
          if (nameEn) updates.nameEn = nameEn;
          if (phone) updates.phone = phone;
          if (email !== undefined) updates.email = email || null;
          if (password) updates.passwordHash = await hashPassword(password);
          await db.update(members).set(updates).where(eq(members.id, id));

          await writeActivityLog({
            action: "permissions_changed",
            textAr: `${tokenUser.name.ar} عدّل بيانات ${target.nameAr}`,
            textEn: `${tokenUser.name.en} edited ${target.nameEn}'s details`,
            actorId: tokenUser.id,
            targetId: id,
          });
        } else {
          const active = action === "reactivate";
          await db.update(members).set({ active }).where(eq(members.id, id));

          await writeActivityLog({
            action: active ? "admin_reactivated" : "admin_deactivated",
            textAr: `${tokenUser.name.ar} ${active ? "أعاد تفعيل" : "عطّل"} ${target.nameAr}`,
            textEn: `${tokenUser.name.en} ${active ? "reactivated" : "deactivated"} ${target.nameEn}`,
            actorId: tokenUser.id,
            targetId: id,
          });
        }

        const updated = await db.query.members.findFirst({ where: eq(members.id, id) });
        return new Response(JSON.stringify(updated), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
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
