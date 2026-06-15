import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { Avatar, StatusPill } from "@/components/app-shell";
import { LanguageToggle } from "@/components/language-toggle";
import { ScanLine, Users, Clock3 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Scanner — Admin" }] }),
  component: ScannerPage,
});

function ScannerPage() {
  const { t, lang } = useLang();
  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/profile" className="flex items-center gap-3">
          <Avatar initials="GS" size={44} />
          <div>
            <p className="text-[11px] text-muted-foreground">{lang === "ar" ? "مرحباً" : "Hello"}</p>
            <p className="text-sm font-semibold text-foreground">{lang === "ar" ? "أ. جورج صموئيل" : "Mr. George Samuel"}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <StatusPill tone="gold">{t("admin")}</StatusPill>
          <LanguageToggle subtle />
        </div>
      </div>

      {/* Scanner card */}
      <section className="relative mt-6 overflow-hidden rounded-3xl bg-card p-6 shadow-elevated">
        <div className="absolute inset-x-0 top-0 h-1 primary-gradient" aria-hidden />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("scanner")}</p>
        <h2 className="mt-1 text-lg font-bold text-foreground">{t("scanQr")}</h2>

        <div className="relative mt-5 aspect-square w-full overflow-hidden rounded-3xl bg-[oklch(0.12_0.02_30)]">
          {/* viewfinder */}
          <div className="absolute inset-0 grid place-items-center">
            <ScanLine className="h-14 w-14 text-gold/70" />
          </div>
          <Corner className="left-3 top-3" />
          <Corner className="right-3 top-3 rotate-90" />
          <Corner className="bottom-3 right-3 rotate-180" />
          <Corner className="bottom-3 left-3 -rotate-90" />
          <div className="absolute inset-x-10 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        <button className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl primary-gradient text-sm font-semibold text-primary-foreground shadow-card">
          <ScanLine className="h-4 w-4" /> {t("scanQr")}
        </button>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <SummaryCard icon={<Users className="h-5 w-5" />} value="42" label={t("todayCheckIns")} tone="primary" />
        <SummaryCard icon={<Clock3 className="h-5 w-5" />} value="5" label={t("pendingApprovals")} tone="gold" />
      </div>
    </div>
  );
}

function Corner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`absolute h-6 w-6 border-l-2 border-t-2 border-gold ${className}`}
      style={{ borderTopLeftRadius: 6 }}
      aria-hidden
    />
  );
}

function SummaryCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tone: "primary" | "gold";
}) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-soft">
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
          tone === "primary" ? "bg-primary-soft text-primary" : "bg-gold-soft text-gold-foreground"
        }`}
      >
        {icon}
      </span>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
