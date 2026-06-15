import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { allMembers } from "@/lib/mock-data";
import { PageHeader, Avatar, StatusPill } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";

const roleFilters = ["all", "member", "admin", "superAdmin"] as const;
const statusFilters = ["all", "approved", "pending", "rejected"] as const;

export const Route = createFileRoute("/super/members")({
  head: () => ({ meta: [{ title: "Members Center" }] }),
  component: MembersCenter,
});

function MembersCenter() {
  const { t, lang } = useLang();
  const [role, setRole] = useState<(typeof roleFilters)[number]>("all");
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("all");
  const [open, setOpen] = useState<string | null>(null);

  const roleMatch: Record<string, string> = { all: "*", member: "member", admin: "admin", superAdmin: "super-admin" };

  const filtered = allMembers.filter((m) => {
    const r = roleMatch[role];
    const okRole = r === "*" || m.role === r;
    const okStatus = status === "all" || m.status === status;
    return okRole && okStatus;
  });

  return (
    <div>
      <PageHeader title={t("membersCenter")} subtitle={`${filtered.length} / ${allMembers.length}`} />

      <div className="px-5 pt-5">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("search")} className="h-11 rounded-2xl ps-10" />
        </div>

        <p className="mt-4 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("role")}</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {roleFilters.map((r) => (
            <Chip key={r} active={role === r} onClick={() => setRole(r)}>
              {t(r)}
            </Chip>
          ))}
        </div>

        <p className="mt-4 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("status")}</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
              {t(s)}
            </Chip>
          ))}
        </div>

        <ul className="mt-5 space-y-3">
          {filtered.map((m) => {
            const expanded = open === m.id;
            const statusTone =
              m.status === "approved" ? "success" : m.status === "pending" ? "warning" : "destructive";
            return (
              <li key={m.id} className="overflow-hidden rounded-2xl bg-card shadow-soft">
                <button
                  onClick={() => setOpen(expanded ? null : m.id)}
                  className="flex w-full items-center gap-3 p-3 text-start"
                >
                  <Avatar
                    initials={m.name[lang].split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    size={40}
                    tone={m.role === "member" ? "primary" : "gold"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{m.name[lang]}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {m.role === "member" ? t("member") : m.role === "admin" ? t("admin") : t("superAdmin")}
                      </span>
                      <StatusPill tone={statusTone}>{t(m.status as "approved" | "pending" | "rejected")}</StatusPill>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
                {expanded && (
                  <dl className="border-t border-border bg-secondary/40 px-4 py-3 text-xs">
                    <Row label={t("phone")} value={m.phone} ltr />
                    <Row label={t("registeredOn")} value={m.registered} ltr />
                    <Row label={t("approvedBy")} value={m.approvedBy ? m.approvedBy[lang] : "—"} />
                    <Row label={t("scannedBy")} value={m.scannedBy ? m.scannedBy[lang] : "—"} />
                    <Row label={t("lastAttendance")} value={m.lastAttendance ? m.lastAttendance[lang] : "—"} />
                  </dl>
                )}
              </li>
            );
          })}
        </ul>
      </div>
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
