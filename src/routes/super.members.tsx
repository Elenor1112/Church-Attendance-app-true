import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { PageHeader, Avatar, StatusPill } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, Plus, X, Save, UserCog } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth-client";

const roleFilters = ["all", "member", "admin", "superAdmin"] as const;
const statusFilters = ["all", "approved", "pending", "rejected"] as const;

type Permission = "scan" | "view_logs" | "send_messages" | "generate_reports";
const ALL_PERMISSIONS: Permission[] = ["scan", "view_logs", "send_messages", "generate_reports"];

export const Route = createFileRoute("/super/members")({
  head: () => ({ meta: [{ title: "Members Center" }] }),
  component: MembersCenter,
});

function MembersCenter() {
  const { t, lang } = useLang();
  const [role, setRole] = useState<(typeof roleFilters)[number]>("all");
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [editPermsMember, setEditPermsMember] = useState<any | null>(null);

  const roleMatch: Record<string, string> = { all: "*", member: "member", admin: "admin", superAdmin: "super-admin" };

  const loadMembers = async () => {
    try {
      const res = await authenticatedFetch(
        `/api/admin/members?role=${roleMatch[role] === "*" ? "all" : roleMatch[role]}&status=${status}&search=${encodeURIComponent(search)}`,
      );
      if (res.ok) {
        const data = await res.json();
        // Enrich admins with their permissions
        const enriched = await Promise.all(
          data.map(async (m: any) => {
            if (m.role === "admin") {
              try {
                const pr = await authenticatedFetch(`/api/admin/${m.id}/permissions`);
                if (pr.ok) {
                  const pd = await pr.json();
                  return { ...m, permissions: pd.permissions };
                }
              } catch {}
            }
            return m;
          }),
        );
        setMembers(enriched);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadMembers(); }, [role, status, search]);

  const toggleActive = async (m: any) => {
    const action = m.active === false ? "reactivate" : "deactivate";
    try {
      const res = await authenticatedFetch("/api/admin/members", {
        method: "POST",
        body: JSON.stringify({ action, id: m.id }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, active: updated.active } : x)));
      }
    } catch {}
  };

  const filtered = members.filter((m) => {
    const r = roleMatch[role];
    const okRole = r === "*" || m.role === r;
    const okStatus = status === "all" || m.status === status;
    return okRole && okStatus;
  });

  return (
    <div>
      <PageHeader
        title={t("membersCenter")}
        subtitle={`${filtered.length} / ${members.length}`}
        right={
          <button
            onClick={() => setShowCreateAdmin(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-soft"
          >
            <Plus className="h-3.5 w-3.5" /> {t("createAdmin")}
          </button>
        }
      />

      <div className="px-5 pt-5">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="h-11 rounded-2xl ps-10"
          />
        </div>

        <p className="mt-4 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("role")}</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {roleFilters.map((r) => (
            <Chip key={r} active={role === r} onClick={() => setRole(r)}>
              {t(r as any)}
            </Chip>
          ))}
        </div>

        <p className="mt-4 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("status")}</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
              {t(s as any)}
            </Chip>
          ))}
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {filtered.map((m) => {
              const expanded = open === m.id;
              const statusTone = m.status === "approved" ? "success" : m.status === "pending" ? "warning" : "destructive";
              return (
                <li key={m.id} className="overflow-hidden rounded-2xl bg-card shadow-soft">
                  <button
                    onClick={() => setOpen(expanded ? null : m.id)}
                    className="flex w-full items-center gap-3 p-3 text-start"
                  >
                    <Avatar
                      initials={m.name[lang].split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                      size={40}
                      tone={m.role === "member" ? "primary" : "gold"}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{m.name[lang]}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">
                          {m.role === "member" ? t("member") : m.role === "admin" ? t("admin") : t("superAdmin")}
                        </span>
                        <StatusPill tone={statusTone}>{t(m.status as any)}</StatusPill>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  {expanded && (
                    <dl className="border-t border-border bg-secondary/40 px-4 py-3 text-xs">
                      <Row label={t("phone")} value={m.phone} ltr />
                      <Row label={t("registeredOn")} value={m.registered} ltr />
                      <Row label={t("approvedBy")} value={m.approvedBy ? m.approvedBy[lang] : "—"} />
                      <Row label={t("lastAttendance")} value={m.lastAttendance ? m.lastAttendance[lang] : "—"} />
                      {m.role === "admin" && (
                        <div className="mt-2">
                          <p className="text-muted-foreground">{t("adminPermissions")}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(m.permissions ?? []).length === 0 ? (
                              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{t("noPermissions")}</span>
                            ) : (
                              (m.permissions ?? []).map((perm: string) => (
                                <span key={perm} className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                                  {t((`perm${perm.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join("")}`) as any)}
                                </span>
                              ))
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              onClick={() => setEditPermsMember(m)}
                              className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-1.5 text-[11px] font-semibold text-foreground"
                            >
                              <UserCog className="h-3 w-3" /> {t("editPermissions")}
                            </button>
                            <button
                              onClick={() => toggleActive(m)}
                              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-semibold ${
                                m.active === false
                                  ? "bg-[color-mix(in_oklab,var(--color-success)_14%,transparent)] text-success"
                                  : "bg-[color-mix(in_oklab,var(--color-destructive)_12%,transparent)] text-destructive"
                              }`}
                            >
                              {m.active === false ? t("reactivate" as any) : t("deactivate" as any)}
                            </button>
                          </div>
                          {m.active === false && (
                            <p className="mt-1 text-[10px] font-semibold text-destructive">{t("deactivated" as any)}</p>
                          )}
                        </div>
                      )}
                    </dl>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showCreateAdmin && (
        <CreateAdminModal
          onClose={() => setShowCreateAdmin(false)}
          onCreated={() => { setShowCreateAdmin(false); loadMembers(); }}
        />
      )}

      {editPermsMember && (
        <EditPermissionsModal
          member={editPermsMember}
          onClose={() => setEditPermsMember(null)}
          onSaved={(updatedPerms) => {
            setMembers((prev) =>
              prev.map((m) => (m.id === editPermsMember.id ? { ...m, permissions: updatedPerms } : m)),
            );
            setEditPermsMember(null);
          }}
        />
      )}
    </div>
  );
}

function CreateAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t, lang } = useLang();
  const [form, setForm] = useState({ nameEn: "", nameAr: "", phone: "", password: "", confirmPassword: "" });
  const [selectedPerms, setSelectedPerms] = useState<Set<Permission>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePerm = (p: Permission) =>
    setSelectedPerms((s) => { const n = new Set(s); n.has(p) ? n.delete(p) : n.add(p); return n; });

  const handleSubmit = async () => {
    setError(null);
    if (!form.nameEn || !form.nameAr || !form.phone || !form.password) {
      setError(lang === "ar" ? "جميع الحقول مطلوبة" : "All fields are required");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(lang === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const res = await authenticatedFetch("/api/admin/create", {
        method: "POST",
        body: JSON.stringify({
          nameEn: form.nameEn,
          nameAr: form.nameAr,
          phone: form.phone,
          password: form.password,
          permissions: Array.from(selectedPerms),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error"); } else { onCreated(); }
    } catch {
      setError(lang === "ar" ? "خطأ في الاتصال" : "Connection error");
    } finally {
      setSaving(false);
    }
  };

  const permLabels: Record<Permission, string> = {
    scan: t("permScan"),
    view_logs: t("permViewLogs"),
    send_messages: t("permSendMessages"),
    generate_reports: t("permGenerateReports"),
  };

  return (
    <ModalOverlay onClose={onClose} title={t("createAdmin")}>
      {error && (
        <p className="mb-3 rounded-xl bg-[color-mix(in_oklab,var(--color-destructive)_12%,transparent)] px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
      <div className="space-y-3">
        <Field label={lang === "ar" ? "الاسم بالإنجليزية" : "Name (English)"} value={form.nameEn} onChange={(v) => setForm({ ...form, nameEn: v })} dir="ltr" />
        <Field label={lang === "ar" ? "الاسم بالعربية" : "Name (Arabic)"} value={form.nameAr} onChange={(v) => setForm({ ...form, nameAr: v })} dir="rtl" />
        <Field label={t("phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} dir="ltr" type="tel" />
        <Field label={t("password")} value={form.password} onChange={(v) => setForm({ ...form, password: v })} type="password" />
        <Field label={t("confirmPassword")} value={form.confirmPassword} onChange={(v) => setForm({ ...form, confirmPassword: v })} type="password" />

        <div>
          <p className="mb-2 text-xs font-semibold text-foreground">{t("adminPermissions")}</p>
          <div className="space-y-2">
            {ALL_PERMISSIONS.map((perm) => (
              <label key={perm} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={selectedPerms.has(perm)}
                  onChange={() => togglePerm(perm)}
                  className="h-4 w-4 accent-primary"
                />
                <span>{permLabels[perm]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl primary-gradient text-sm font-semibold text-primary-foreground shadow-card disabled:opacity-50"
      >
        {saving ? (lang === "ar" ? "جاري الإنشاء..." : "Creating...") : t("createAdmin")}
      </button>
    </ModalOverlay>
  );
}

function EditPermissionsModal({
  member,
  onClose,
  onSaved,
}: {
  member: any;
  onClose: () => void;
  onSaved: (perms: Permission[]) => void;
}) {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState<Set<Permission>>(new Set(member.permissions ?? []));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePerm = (p: Permission) =>
    setSelected((s) => { const n = new Set(s); n.has(p) ? n.delete(p) : n.add(p); return n; });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await authenticatedFetch(`/api/admin/${member.id}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permissions: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error"); } else { onSaved(data.permissions); }
    } catch {
      setError(lang === "ar" ? "خطأ في الاتصال" : "Connection error");
    } finally {
      setSaving(false);
    }
  };

  const permLabels: Record<Permission, string> = {
    scan: t("permScan"),
    view_logs: t("permViewLogs"),
    send_messages: t("permSendMessages"),
    generate_reports: t("permGenerateReports"),
  };

  return (
    <ModalOverlay onClose={onClose} title={`${t("editPermissions")} — ${member.name[lang]}`}>
      {error && (
        <p className="mb-3 rounded-xl bg-[color-mix(in_oklab,var(--color-destructive)_12%,transparent)] px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
      <div className="space-y-2">
        {ALL_PERMISSIONS.map((perm) => (
          <label key={perm} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={selected.has(perm)}
              onChange={() => togglePerm(perm)}
              className="h-4 w-4 accent-primary"
            />
            <span>{permLabels[perm]}</span>
          </label>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl primary-gradient text-sm font-semibold text-primary-foreground shadow-card disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") : t("savePermissions")}
      </button>
    </ModalOverlay>
  );
}

function ModalOverlay({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm overflow-y-auto rounded-3xl bg-card p-6 shadow-elevated" style={{ maxHeight: "85vh" }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  dir,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "ltr" | "rtl";
  type?: string;
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold text-muted-foreground">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        className="w-full rounded-2xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
      />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        active ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-secondary-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground" dir={ltr ? "ltr" : undefined}>{value}</dd>
    </div>
  );
}
