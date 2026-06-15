import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { memberNotifications } from "@/lib/mock-data";
import { PageHeader } from "@/components/app-shell";
import { Bell, BellOff, Calendar, Cake, CheckCircle2, Megaphone } from "lucide-react";

export const Route = createFileRoute("/member/alerts")({
  head: () => ({ meta: [{ title: "Alerts" }] }),
  component: Alerts,
});

const iconFor = (id: string) => {
  if (id === "1") return Calendar;
  if (id === "2") return Cake;
  if (id === "3") return CheckCircle2;
  return Megaphone;
};

function Alerts() {
  const { t, lang } = useLang();
  const [items, setItems] = useState(memberNotifications);

  return (
    <div>
      <PageHeader
        title={t("alerts")}
        subtitle={lang === "ar" ? `${items.filter((i) => i.unread).length} إشعار غير مقروء` : `${items.filter((i) => i.unread).length} unread`}
        right={
          items.length > 0 && (
            <button
              onClick={() => setItems([])}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t("clearAll")}
            </button>
          )
        }
      />

      <div className="px-5 pt-5">
        {items.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <ul className="space-y-3">
            {items.map((n) => {
              const Icon = iconFor(n.id);
              return (
                <li
                  key={n.id}
                  className={`relative flex gap-3 rounded-2xl border bg-card p-4 shadow-soft ${
                    n.unread ? "border-primary/20" : "border-border"
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{n.title[lang]}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{n.time[lang]}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.body[lang]}</p>
                  </div>
                  {n.unread && <span className="absolute end-3 top-3 h-2 w-2 rounded-full bg-primary" />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState({ t }: { t: (k: never) => string }) {
  return (
    <div className="mt-12 flex flex-col items-center text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground">
        <BellOff className="h-7 w-7" />
      </span>
      <p className="mt-4 text-base font-semibold text-foreground">{(t as (k: string) => string)("noAlerts")}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{(t as (k: string) => string)("noAlertsDesc")}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
        <Bell className="h-3.5 w-3.5" /> {(t as (k: string) => string)("alerts")}
      </span>
    </div>
  );
}
