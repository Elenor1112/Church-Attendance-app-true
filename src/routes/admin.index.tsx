import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import { Avatar, StatusPill } from "@/components/app-shell";
import { LanguageToggle } from "@/components/language-toggle";
import { ScanLine, Users, Clock3, CheckCircle2, X } from "lucide-react";
import { getSession, authenticatedFetch } from "@/lib/auth-client";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Scanner — Admin" }] }),
  component: ScannerPage,
});

type FridayCategory = "contemporary_issues" | "bible_study" | "spirituality" | "saints_lives";

const CATEGORIES: { key: FridayCategory; labelKey: string }[] = [
  { key: "contemporary_issues", labelKey: "contemporaryIssues" },
  { key: "bible_study", labelKey: "bibleStudy" },
  { key: "spirituality", labelKey: "spirituality" },
  { key: "saints_lives", labelKey: "saintsLives" },
];

function ScannerPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const session = getSession();
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [pendingPayload, setPendingPayload] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FridayCategory | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [stats, setStats] = useState({ todayCheckIns: 0, pendingApprovals: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session) { navigate({ to: "/" }); return; }
    const loadStats = async () => {
      try {
        const [logsRes, membersRes] = await Promise.all([
          authenticatedFetch("/api/attendance?filter=today"),
          authenticatedFetch("/api/admin/members?status=pending"),
        ]);
        if (logsRes.ok && membersRes.ok) {
          const [logs, pendingMembers] = await Promise.all([logsRes.json(), membersRes.json()]);
          setStats({ todayCheckIns: logs.length, pendingApprovals: pendingMembers.length });
        }
      } catch {}
    };
    loadStats();
  }, []);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleQrDecode = (payload: string) => {
    if (!payload.trim()) return;
    setPendingPayload(payload.trim());
    setSelectedCategory(null);
    setScanning(false);
  };

  const submitScan = async (category: FridayCategory) => {
    if (!pendingPayload) return;
    try {
      const res = await authenticatedFetch("/api/attendance", {
        method: "POST",
        body: JSON.stringify({ payload: pendingPayload, fridayCategory: category }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || (lang === "ar" ? "فشل تسجيل الحضور" : "Failed to record attendance"), false);
      } else {
        const name = data.name?.[lang] || "";
        const catLabel = t(CATEGORIES.find((c) => c.key === category)!.labelKey as any);
        showToast(`${t("scanSuccess")} — ${name} · ${catLabel}`, true);
        setStats((s) => ({ ...s, todayCheckIns: s.todayCheckIns + 1 }));
      }
    } catch {
      showToast(lang === "ar" ? "خطأ في الاتصال" : "Connection error", false);
    } finally {
      setPendingPayload(null);
      setSelectedCategory(null);
    }
  };

  const handleManualSubmit = () => {
    const val = manualInput.trim();
    if (val) { handleQrDecode(val); setManualInput(""); }
  };

  const currentUser = session?.user;

  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/admin/profile" className="flex items-center gap-3">
          <Avatar initials={currentUser?.initials ?? "GS"} size={44} />
          <div>
            <p className="text-[11px] text-muted-foreground">{lang === "ar" ? "مرحباً" : "Hello"}</p>
            <p className="text-sm font-semibold text-foreground">{currentUser?.name[lang] ?? ""}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <StatusPill tone="gold">{t("admin")}</StatusPill>
          <LanguageToggle subtle />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-elevated ${
            toast.ok
              ? "bg-[color-mix(in_oklab,var(--color-success)_14%,transparent)] text-success"
              : "bg-[color-mix(in_oklab,var(--color-destructive)_14%,transparent)] text-destructive"
          }`}
        >
          {toast.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Scanner card */}
      <section className="relative mt-6 overflow-hidden rounded-3xl bg-card p-6 shadow-elevated">
        <div className="absolute inset-x-0 top-0 h-1 primary-gradient" aria-hidden />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("scanner")}</p>
        <h2 className="mt-1 text-lg font-bold text-foreground">{t("scanQr")}</h2>

        <div className="relative mt-5 aspect-square w-full overflow-hidden rounded-3xl bg-[oklch(0.12_0.02_30)]">
          <div className="absolute inset-0 grid place-items-center">
            <ScanLine className="h-14 w-14 text-gold/70" />
          </div>
          <Corner className="left-3 top-3" />
          <Corner className="right-3 top-3 rotate-90" />
          <Corner className="bottom-3 right-3 rotate-180" />
          <Corner className="bottom-3 left-3 -rotate-90" />
          <div className="absolute inset-x-10 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-gold to-transparent" />
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <p className="text-sm font-semibold text-white">
                {lang === "ar" ? "جاري المسح... أدخل يدوياً أدناه" : "Scanning... or enter manually below"}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setScanning((v) => !v)}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl primary-gradient text-sm font-semibold text-primary-foreground shadow-card"
        >
          <ScanLine className="h-4 w-4" />
          {scanning ? (lang === "ar" ? "إيقاف المسح" : "Stop Scanning") : t("scanQr")}
        </button>

        {/* Manual entry */}
        <div className="mt-3 flex gap-2">
          <input
            ref={inputRef}
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
            placeholder={lang === "ar" ? "أدخل معرّف العضو يدوياً..." : "Enter member ID manually..."}
            className="flex-1 rounded-2xl border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            dir="ltr"
          />
          <button
            onClick={handleManualSubmit}
            disabled={!manualInput.trim()}
            className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            {t("send")}
          </button>
        </div>
      </section>

      {/* Category picker modal */}
      {pendingPayload && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-elevated">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">{t("selectCategory")}</h3>
              <button onClick={() => setPendingPayload(null)} className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {lang === "ar" ? "اختر فئة الجمعة قبل تأكيد الحضور" : "Select the Friday category before confirming attendance"}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => submitScan(cat.key)}
                  className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-border bg-secondary text-sm font-semibold text-foreground transition hover:border-primary hover:bg-primary-soft hover:text-primary"
                >
                  <span className="text-xl">
                    {cat.key === "contemporary_issues" ? "💬" : cat.key === "bible_study" ? "📖" : cat.key === "spirituality" ? "🕊️" : "✨"}
                  </span>
                  <span className="text-center text-xs leading-tight">{t(cat.labelKey as any)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <SummaryCard icon={<Users className="h-5 w-5" />} value={String(stats.todayCheckIns)} label={t("todayCheckIns")} tone="primary" />
        <SummaryCard icon={<Clock3 className="h-5 w-5" />} value={String(stats.pendingApprovals)} label={t("pendingApprovals")} tone="gold" />
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

function SummaryCard({ icon, value, label, tone }: { icon: React.ReactNode; value: string; label: string; tone: "primary" | "gold" }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-soft">
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${tone === "primary" ? "bg-primary-soft text-primary" : "bg-gold-soft text-gold-foreground"}`}>
        {icon}
      </span>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
