import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { Avatar, StatusPill } from "@/components/app-shell";
import { LanguageToggle } from "@/components/language-toggle";
import { recentActivity } from "@/lib/mock-data";
import { Users, UserCog, ScanLine, Clock3, TrendingUp, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/super/")({
  head: () => ({ meta: [{ title: "Super Admin Dashboard" }] }),
  component: SuperHome,
});

function SuperHome() {
  const { t, lang } = useLang();

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <Link to="/super/profile" className="flex items-center gap-3">
          <Avatar initials="MH" size={44} />
          <div>
            <p className="text-[11px] text-muted-foreground">{lang === "ar" ? "مرحباً" : "Hello"}</p>
            <p className="text-sm font-semibold text-foreground">{lang === "ar" ? "د. مرقس حنا" : "Dr. Marcus Hanna"}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <StatusPill tone="gold">{t("superAdmin")}</StatusPill>
          <LanguageToggle subtle />
        </div>
      </div>

      <section className="mt-6 overflow-hidden rounded-3xl primary-gradient p-5 text-primary-foreground shadow-elevated">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-soft">{t("dashboard")}</p>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold">248</p>
            <p className="mt-1 text-xs text-primary-foreground/80">{t("registeredMembers")}</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-card/15 px-2.5 py-1 text-xs font-semibold text-gold-soft">
            <TrendingUp className="h-3 w-3" /> +12 {lang === "ar" ? "هذا الشهر" : "this month"}
          </div>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Kpi icon={<Users className="h-5 w-5" />} value="248" label={t("totalMembers")} tone="primary" />
        <Kpi icon={<UserCog className="h-5 w-5" />} value="6" label={t("totalAdmins")} tone="gold" />
        <Kpi icon={<ScanLine className="h-5 w-5" />} value="42" label={t("todayCheckIns")} tone="primary" />
        <Kpi icon={<Clock3 className="h-5 w-5" />} value="3" label={t("pendingApprovals")} tone="warning" />
      </div>

      <section className="mt-5 rounded-2xl bg-card p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">{t("recentActivity")}</p>
          <Link to="/super/members" className="inline-flex items-center text-[11px] font-semibold text-primary">
            {t("all")} <ChevronRight className="h-3 w-3 rtl:rotate-180" />
          </Link>
        </div>
        <ul className="mt-3 space-y-3">
          {recentActivity.map((a) => (
            <li key={a.id} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{a.text[lang]}</p>
                <p className="text-[11px] text-muted-foreground">{a.time[lang]}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Kpi({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tone: "primary" | "gold" | "warning";
}) {
  const styles: Record<string, string> = {
    primary: "bg-primary-soft text-primary",
    gold: "bg-gold-soft text-gold-foreground",
    warning: "bg-[color-mix(in_oklab,var(--color-warning)_18%,transparent)] text-warning-foreground",
  };
  return (
    <div className="rounded-2xl bg-card p-4 shadow-soft">
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${styles[tone]}`}>{icon}</span>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
