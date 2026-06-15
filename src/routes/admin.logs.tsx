import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { attendanceLogs } from "@/lib/mock-data";
import { PageHeader, StatusPill, Avatar } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const filters = ["today", "thisWeek", "all"] as const;

export const Route = createFileRoute("/admin/logs")({
  head: () => ({ meta: [{ title: "Attendance Log" }] }),
  component: Logs,
});

function Logs() {
  const { t, lang } = useLang();
  const [active, setActive] = useState<(typeof filters)[number]>("today");

  return (
    <div>
      <PageHeader title={t("attendanceLog")} subtitle={`${attendanceLogs.length} ${lang === "ar" ? "سجل" : "records"}`} />

      <div className="px-5 pt-5">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("search")} className="h-11 rounded-2xl ps-10" />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                active === f ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {t(f)}
            </button>
          ))}
        </div>

        <ul className="mt-4 space-y-3">
          {attendanceLogs.map((log) => (
            <li key={log.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
              <Avatar initials={log.name[lang].split(" ").map((w) => w[0]).slice(0, 2).join("")} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{log.name[lang]}</p>
                <p className="text-[11px] text-muted-foreground">
                  {log.date[lang]} · <span dir="ltr">{log.time}</span>
                </p>
              </div>
              <StatusPill tone={log.status === "on-time" ? "success" : "warning"}>
                {log.status === "on-time" ? (lang === "ar" ? "في الموعد" : "On time") : (lang === "ar" ? "متأخر" : "Late")}
              </StatusPill>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
