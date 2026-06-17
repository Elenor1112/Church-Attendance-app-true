import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { authenticatedFetch, getSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { BarChart3, Calendar, Layers, Trophy, Gift } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Admin" }] }),
  component: ReportsScreen,
});

type Tab = "attendance_by_date" | "attendance_by_category" | "top_attendees" | "set_completion" | "reward_distribution";

function ReportsScreen() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const session = getSession();
  const [tab, setTab] = useState<Tab>("attendance_by_date");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      navigate({ to: "/" });
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    authenticatedFetch(`/api/reports?type=${tab}`)
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (res.status === 403) {
          setError(lang === "ar" ? "ليس لديك صلاحية إنشاء التقارير" : "You don't have permission to generate reports");
          return;
        }
        if (!res.ok) {
          setError(body.error || "Failed to load report");
          return;
        }
        setData(body);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const tabs: { key: Tab; label: string; icon: typeof Calendar }[] = [
    { key: "attendance_by_date", label: t("attendanceByDate" as any), icon: Calendar },
    { key: "attendance_by_category", label: t("attendanceByCategory" as any), icon: Layers },
    { key: "top_attendees", label: t("topAttendees" as any), icon: Trophy },
    { key: "set_completion", label: t("setCompletionReport" as any), icon: BarChart3 },
    { key: "reward_distribution", label: t("rewardDistribution" as any), icon: Gift },
  ];

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">{t("reports" as any)}</h1>
        </div>
        <LanguageToggle subtle />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              tab === tb.key ? "primary-gradient text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            <tb.icon className="h-3.5 w-3.5" />
            {tb.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {loading && <p className="text-sm text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>}
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive-foreground">
            {error}
          </div>
        )}
        {!loading && !error && data && <ReportTable tab={tab} data={data} lang={lang} />}
      </div>
    </div>
  );
}

function ReportTable({ tab, data, lang }: { tab: Tab; data: any; lang: "ar" | "en" }) {
  const Row = ({ left, right }: { left: string; right: string | number }) => (
    <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3 text-sm shadow-soft">
      <span className="font-medium text-foreground">{left}</span>
      <span className="font-bold text-primary">{right}</span>
    </div>
  );

  if (tab === "attendance_by_date") {
    const rows = data.attendanceByDate ?? [];
    if (!rows.length) return <Empty lang={lang} />;
    return <div className="space-y-2">{rows.map((r: any) => <Row key={r.date} left={r.date} right={r.count} />)}</div>;
  }
  if (tab === "attendance_by_category") {
    const rows = data.attendanceByCategory ?? [];
    return <div className="space-y-2">{rows.map((r: any) => <Row key={r.category} left={r.label[lang]} right={r.count} />)}</div>;
  }
  if (tab === "top_attendees") {
    const rows = data.topAttendees ?? [];
    if (!rows.length) return <Empty lang={lang} />;
    return <div className="space-y-2">{rows.map((r: any) => <Row key={r.memberId} left={r.name[lang]} right={r.count} />)}</div>;
  }
  if (tab === "set_completion") {
    const rows = data.setCompletion ?? [];
    if (!rows.length) return <Empty lang={lang} />;
    return (
      <div className="space-y-2">
        {rows.map((r: any) => (
          <Row
            key={r.memberId}
            left={r.name[lang]}
            right={`${r.completedSets}${r.pendingReward ? " 🎁" : ""}`}
          />
        ))}
      </div>
    );
  }
  // reward_distribution
  const rows = data.rewardDistribution ?? [];
  if (!rows.length) return <Empty lang={lang} />;
  return (
    <div className="space-y-2">
      {rows.map((r: any) => (
        <div key={r.setId} className="rounded-xl bg-card px-4 py-3 text-sm shadow-soft">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{r.member[lang]}</span>
            <span className="font-bold text-primary">#{r.setNumber}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {(lang === "ar" ? "بواسطة " : "by ") + (r.approvedBy ? r.approvedBy[lang] : "—")}
            {r.approvedAt ? ` · ${new Date(r.approvedAt).toLocaleDateString()}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}

function Empty({ lang }: { lang: "ar" | "en" }) {
  return <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد بيانات بعد" : "No data yet"}</p>;
}
