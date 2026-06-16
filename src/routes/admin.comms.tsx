import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { PageHeader, Avatar, StatusPill } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Cake, Send, Search, AlertTriangle, CheckCircle2, Gift } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth-client";

const tabs = ["birthdays", "sendAlerts", "receipts", "absences", "setCompletions"] as const;

export const Route = createFileRoute("/admin/comms")({
  head: () => ({ meta: [{ title: "Communications — Admin" }] }),
  component: Comms,
});

function Comms() {
  const { t } = useLang();
  const [tab, setTab] = useState<(typeof tabs)[number]>("birthdays");
  const [commsData, setCommsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [setNotifs, setSetNotifs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [commsRes, setsRes] = await Promise.all([
          authenticatedFetch("/api/admin/comms"),
          authenticatedFetch("/api/set-notifications?acknowledged=false"),
        ]);
        if (commsRes.ok) setCommsData(await commsRes.json());
        if (setsRes.ok) setSetNotifs(await setsRes.json());
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const pendingSetCount = setNotifs.length;

  return (
    <div>
      <PageHeader title={t("comms")} />

      <div className="px-5 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tname) => (
            <button
              key={tname}
              onClick={() => setTab(tname)}
              className={`relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                tab === tname ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {t(tname as any)}
              {tname === "setCompletions" && pendingSetCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                  {pendingSetCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === "birthdays" && <Birthdays data={commsData?.birthdays ?? []} loading={loading} />}
          {tab === "sendAlerts" && <SendAlerts approvedMembers={commsData?.approvedMembers ?? []} loading={loading} />}
          {tab === "receipts" && <Receipts data={commsData?.receipts ?? []} loading={loading} />}
          {tab === "absences" && <Absences data={commsData?.absences ?? []} loading={loading} />}
          {tab === "setCompletions" && <SetCompletions notifs={setNotifs} setNotifs={setSetNotifs} />}
        </div>
      </div>
    </div>
  );
}

function Birthdays({ data, loading }: { data: any[]; loading: boolean }) {
  const { lang, t } = useLang();
  if (loading) return <p className="text-sm text-muted-foreground">{t("loading" as any)}</p>;
  return (
    <ul className="space-y-3">
      {data.map((b: any) => (
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

function SendAlerts({ approvedMembers, loading }: { approvedMembers: any[]; loading: boolean }) {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [bodyAr, setBodyAr] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [recipientMode, setRecipientMode] = useState<"all" | "specific">("all");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allOn = selected.size === approvedMembers.length;

  const handleSend = async () => {
    if ((!titleEn && !titleAr) || (!bodyAr && !bodyEn)) return;
    setSending(true);
    try {
      const recipientIds = recipientMode === "all" ? ["all"] : Array.from(selected);
      const res = await authenticatedFetch("/api/admin/comms", {
        method: "POST",
        body: JSON.stringify({
          type: "custom",
          titleAr: titleAr || titleEn,
          titleEn: titleEn || titleAr,
          bodyAr: bodyAr || bodyEn,
          bodyEn: bodyEn || bodyAr,
          recipientIds,
        }),
      });
      if (res.ok) {
        showToast(t("messageSent"));
        setTitleAr(""); setTitleEn(""); setBodyAr(""); setBodyEn("");
        setSelected(new Set());
      } else {
        const d = await res.json();
        showToast(d.error || "Error");
      }
    } catch {
      showToast(lang === "ar" ? "خطأ في الاتصال" : "Connection error");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>;

  return (
    <div className="space-y-4">
      {toast && (
        <div className="rounded-2xl bg-[color-mix(in_oklab,var(--color-success)_14%,transparent)] px-4 py-3 text-sm font-medium text-success">
          {toast}
        </div>
      )}

      {/* Bilingual subject fields */}
      <input
        value={titleAr}
        onChange={(e) => setTitleAr(e.target.value)}
        placeholder={t("subject")}
        dir="rtl"
        className="w-full rounded-2xl border border-border bg-card p-3 text-sm text-foreground shadow-soft outline-none placeholder:text-muted-foreground focus:border-primary"
      />
      <input
        value={titleEn}
        onChange={(e) => setTitleEn(e.target.value)}
        placeholder={t("subjectEn")}
        dir="ltr"
        className="w-full rounded-2xl border border-border bg-card p-3 text-sm text-foreground shadow-soft outline-none placeholder:text-muted-foreground focus:border-primary"
      />
      <textarea
        rows={3}
        value={bodyAr}
        onChange={(e) => setBodyAr(e.target.value)}
        placeholder={t("bodyAr")}
        dir="rtl"
        className="w-full resize-none rounded-2xl border border-border bg-card p-4 text-sm text-foreground shadow-soft outline-none placeholder:text-muted-foreground focus:border-primary"
      />
      <textarea
        rows={3}
        value={bodyEn}
        onChange={(e) => setBodyEn(e.target.value)}
        placeholder={t("bodyEn")}
        dir="ltr"
        className="w-full resize-none rounded-2xl border border-border bg-card p-4 text-sm text-foreground shadow-soft outline-none placeholder:text-muted-foreground focus:border-primary"
      />

      {/* Recipient mode toggle */}
      <div className="rounded-2xl bg-card p-2 shadow-soft">
        <div className="flex gap-1.5 p-1">
          {(["all", "specific"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setRecipientMode(mode)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                recipientMode === mode ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
              }`}
            >
              {mode === "all" ? t("allMembers") : t("specificMember")}
            </button>
          ))}
        </div>
      </div>

      {recipientMode === "specific" && (
        <>
          <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-soft">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={allOn}
                onChange={() => setSelected(allOn ? new Set() : new Set(approvedMembers.map((m: any) => m.id)))}
                className="h-4 w-4 accent-primary"
              />
              {t("selectAll")}
            </label>
            <span className="text-xs font-semibold text-primary">{selected.size} {t("selected")}</span>
          </div>
          <ul className="space-y-2">
            {approvedMembers.map((m: any) => {
              const checked = selected.has(m.id);
              return (
                <li key={m.id}>
                  <label className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
                    <input type="checkbox" checked={checked} onChange={() => toggle(m.id)} className="h-4 w-4 accent-primary" />
                    <Avatar initials={m.name[lang === "ar" ? "ar" : "en"].split(" ").map((w: string) => w[0]).slice(0, 2).join("")} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{m.name[lang]}</p>
                      <p className="text-[11px] text-muted-foreground" dir="ltr">{m.phone}</p>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <button
        onClick={handleSend}
        disabled={sending || (!titleEn && !titleAr) || (!bodyAr && !bodyEn)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl primary-gradient text-sm font-semibold text-primary-foreground shadow-card disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {sending ? (lang === "ar" ? "جاري الإرسال..." : "Sending...") : `${t("send")} (${recipientMode === "all" ? t("allMembers") : selected.size})`}
      </button>
    </div>
  );
}

function Receipts({ data, loading }: { data: any[]; loading: boolean }) {
  const { t, lang } = useLang();
  if (loading) return <p className="text-sm text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>;
  const fallback = [
    { label: lang === "ar" ? "تذكير الاجتماع" : "Meeting reminder", read: 38, total: 50 },
    { label: lang === "ar" ? "إعلان قداس الأحد" : "Sunday Liturgy", read: 22, total: 50 },
  ];
  const receipts = data.length > 0 ? data : fallback;
  return (
    <ul className="space-y-3">
      {receipts.map((d: any, i) => {
        const label = d.title ? d.title[lang] : d.label;
        const read = d.read ?? 0;
        const total = d.delivered ?? d.total ?? 1;
        const pct = Math.round((read / total) * 100);
        return (
          <li key={i} className="rounded-2xl bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <span className="text-xs font-semibold text-primary">{pct}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full primary-gradient" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" />{read} {t("read")}</span>
              <span>{total - read} {t("unread")}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Absences({ data, loading }: { data: any[]; loading: boolean }) {
  const { t, lang } = useLang();
  if (loading) return <p className="text-sm text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>;
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
        {data.map((a: any) => (
          <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
            <Avatar initials={a.name[lang].split(" ").map((w: string) => w[0]).slice(0, 2).join("")} size={40} />
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

function SetCompletions({ notifs, setNotifs }: { notifs: any[]; setNotifs: (n: any[]) => void }) {
  const { t, lang } = useLang();
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const handleAcknowledge = async (id: string) => {
    setAcknowledging(id);
    try {
      const res = await authenticatedFetch(`/api/set-notifications/${id}/acknowledge`, { method: "PATCH" });
      if (res.ok) {
        setNotifs(notifs.filter((n) => n.id !== id));
      }
    } catch {}
    setAcknowledging(null);
  };

  if (notifs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl">🎁</span>
        <p className="mt-3 text-sm font-semibold text-foreground">
          {lang === "ar" ? "لا توجد مجموعات معلقة" : "No pending set completions"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {lang === "ar" ? "ستظهر هنا عند اكتمال مجموعة" : "They'll appear here when a member completes a set"}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {notifs.map((n: any) => (
        <li key={n.id} className="overflow-hidden rounded-2xl bg-card shadow-soft">
          <div className="flex items-center gap-3 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold-soft text-2xl">🎁</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{n.memberName[lang]}</p>
              <p className="text-[11px] text-muted-foreground">
                {t("setCompleted")} · {new Date(n.triggeredAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
              </p>
              <p className="text-[11px] text-gold-foreground">
                {lang === "ar" ? `المجموعات المكتملة: ${n.completedSets + 1}` : `Completed sets so far: ${n.completedSets + 1}`}
              </p>
            </div>
          </div>
          <div className="border-t border-border px-4 py-3">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                disabled={acknowledging === n.id}
                onChange={() => handleAcknowledge(n.id)}
                className="h-4 w-4 accent-primary"
              />
              {acknowledging === n.id
                ? (lang === "ar" ? "جاري المعالجة..." : "Processing...")
                : t("acknowledge")}
            </label>
          </div>
        </li>
      ))}
    </ul>
  );
}
