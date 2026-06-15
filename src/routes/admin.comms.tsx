import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { upcomingBirthdays, allMembers, fridayAbsences } from "@/lib/mock-data";
import { PageHeader, Avatar, StatusPill } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Cake, Send, Search, AlertTriangle, CheckCircle2 } from "lucide-react";

const tabs = ["birthdays", "sendAlerts", "receipts", "absences"] as const;

export const Route = createFileRoute("/admin/comms")({
  head: () => ({ meta: [{ title: "Communications — Admin" }] }),
  component: Comms,
});

function Comms() {
  const { t } = useLang();
  const [tab, setTab] = useState<(typeof tabs)[number]>("birthdays");

  return (
    <div>
      <PageHeader title={t("comms")} />

      <div className="px-5 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tname) => (
            <button
              key={tname}
              onClick={() => setTab(tname)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                tab === tname ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {t(tname)}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === "birthdays" && <Birthdays />}
          {tab === "sendAlerts" && <SendAlerts />}
          {tab === "receipts" && <Receipts />}
          {tab === "absences" && <Absences />}
        </div>
      </div>
    </div>
  );
}

function Birthdays() {
  const { lang, t } = useLang();
  return (
    <ul className="space-y-3">
      {upcomingBirthdays.map((b) => (
        <li key={b.id} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft">
          <span className="grid h-11 w-11 place-items-center rounded-2xl gold-gradient text-gold-foreground">
            <Cake className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{b.name[lang]}</p>
            <p className="text-[11px] text-muted-foreground">{b.date[lang]}</p>
          </div>
          <div className="text-end">
            <p className="text-base font-bold text-primary">{b.days}</p>
            <p className="text-[10px] text-muted-foreground">{t("daysLeft")}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SendAlerts() {
  const { t, lang } = useLang();
  const members = allMembers.filter((m) => m.status === "approved");
  const [selected, setSelected] = useState<Set<string>>(new Set([members[0].id, members[1].id]));
  const [type, setType] = useState<"standard" | "custom">("standard");

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const allOn = selected.size === members.length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card p-2 shadow-soft">
        <div className="flex gap-1.5 p-1">
          {(["standard", "custom"] as const).map((tp) => (
            <button
              key={tp}
              onClick={() => setType(tp)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                type === tp ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
              }`}
            >
              {tp === "standard" ? t("standardAlert") : t("customAlert")}
            </button>
          ))}
        </div>
      </div>

      <textarea
        rows={3}
        placeholder={t("writeMessage")}
        className="w-full resize-none rounded-2xl border border-border bg-card p-4 text-sm text-foreground shadow-soft outline-none placeholder:text-muted-foreground focus:border-primary"
      />

      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t("search")} className="h-11 rounded-2xl ps-10" />
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-soft">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <input
            type="checkbox"
            checked={allOn}
            onChange={() => setSelected(allOn ? new Set() : new Set(members.map((m) => m.id)))}
            className="h-4 w-4 accent-primary"
          />
          {t("selectAll")}
        </label>
        <span className="text-xs font-semibold text-primary">
          {selected.size} {t("selected")}
        </span>
      </div>

      <ul className="space-y-2">
        {members.map((m) => {
          const checked = selected.has(m.id);
          return (
            <li key={m.id}>
              <label className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
                <input type="checkbox" checked={checked} onChange={() => toggle(m.id)} className="h-4 w-4 accent-primary" />
                <Avatar initials={m.name[lang].split(" ").map((w) => w[0]).slice(0, 2).join("")} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{m.name[lang]}</p>
                  <p className="text-[11px] text-muted-foreground" dir="ltr">{m.phone}</p>
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl primary-gradient text-sm font-semibold text-primary-foreground shadow-card">
        <Send className="h-4 w-4" /> {t("send")} ({selected.size})
      </button>
    </div>
  );
}

function Receipts() {
  const { t, lang } = useLang();
  const data = [
    { label: lang === "ar" ? "تذكير الاجتماع" : "Meeting reminder", read: 38, total: 50 },
    { label: lang === "ar" ? "إعلان قداس الأحد" : "Sunday Liturgy", read: 22, total: 50 },
    { label: lang === "ar" ? "رسالة شخصية" : "Personal message", read: 12, total: 18 },
  ];
  return (
    <ul className="space-y-3">
      {data.map((d) => {
        const pct = Math.round((d.read / d.total) * 100);
        return (
          <li key={d.label} className="rounded-2xl bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{d.label}</p>
              <span className="text-xs font-semibold text-primary">{pct}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full primary-gradient" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" />{d.read} {t("read")}</span>
              <span>{d.total - d.read} {t("unread")}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Absences() {
  const { t, lang } = useLang();
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-warning/30 bg-[color-mix(in_oklab,var(--color-warning)_10%,transparent)] p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-warning/30 text-warning-foreground">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{t("fridayAbsences")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{lang === "ar" ? "أعضاء يحتاجون متابعة" : "Members needing follow-up"}</p>
          </div>
        </div>
      </div>
      <ul className="space-y-2">
        {fridayAbsences.map((a) => (
          <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
            <Avatar initials={a.name[lang].split(" ").map((w) => w[0]).slice(0, 2).join("")} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{a.name[lang]}</p>
              <p className="text-[11px] text-muted-foreground">{t("lastAttendance")}: {a.last[lang]}</p>
            </div>
            <StatusPill tone="destructive">{a.streak} {t("consecutiveAbsences")}</StatusPill>
          </li>
        ))}
      </ul>
    </div>
  );
}
