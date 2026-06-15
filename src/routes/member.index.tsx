import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { Avatar, StatusPill } from "@/components/app-shell";
import { LanguageToggle } from "@/components/language-toggle";
import { CalendarDays, MapPin, Clock, CheckCircle2, Megaphone, ChevronRight, BookOpen } from "lucide-react";
import { getSession, authenticatedFetch } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/member/")({
  head: () => ({ meta: [{ title: "Home — Member" }] }),
  component: MemberHome,
});

function MemberHome() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const session = getSession();
  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate({ to: "/" });
      return;
    }

    const loadData = async () => {
      try {
        const res = await authenticatedFetch("/api/member/home");
        if (res.status === 401) {
          navigate({ to: "/" });
          return;
        }
        const data = await res.json();
        setHomeData(data);
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
      </div>
    );
  }

  const currentUser = session.user;
  const verse = homeData?.verse || {
    ar: "«أنا هو الطريق والحق والحياة. لا يأتي أحد إلى الآب إلا بي.»",
    en: "“I am the way, the truth, and the life. No one comes to the Father except through Me.”",
    ref: { ar: "يوحنا ١٤:٦", en: "John 14:6" }
  };
  const meeting = homeData?.meeting;

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <Link to="/member/profile" className="flex items-center gap-3">
          <Avatar initials={currentUser.initials} size={44} />
          <div>
            <p className="text-[11px] text-muted-foreground">{t("welcome")}</p>
            <p className="text-sm font-semibold text-foreground">{currentUser.name[lang]}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <StatusPill tone="success">{t("approved")}</StatusPill>
          <LanguageToggle subtle />
        </div>
      </div>

      {/* Verse card */}
      <section className="relative mt-6 overflow-hidden rounded-3xl primary-gradient p-5 text-primary-foreground shadow-elevated">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/30 blur-2xl rtl:right-auto rtl:-left-10" aria-hidden />
        <div className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-soft">
          <BookOpen className="h-3.5 w-3.5" />
          {t("verseOfDay")}
        </div>
        <p className="relative mt-3 text-base font-medium leading-relaxed">{verse[lang]}</p>
        <p className="relative mt-3 text-xs font-semibold text-gold-soft">— {verse.ref[lang]}</p>
      </section>

      {/* Meeting card */}
      {meeting && (
        <section className="mt-5 rounded-3xl bg-card p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-foreground">
                {t("weeklyMeeting")}
              </p>
              <h3 className="mt-1 text-base font-bold text-foreground">{meeting.title[lang]}</h3>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gold-gradient text-gold-foreground">
              <CalendarDays className="h-5 w-5" />
            </span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> {meeting.date[lang]}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> {meeting.time[lang]}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> {meeting.location[lang]}
            </li>
          </ul>
        </section>
      )}

      {/* Overview */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <OverviewCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
          label={t("attendance")}
          value={lang === "ar" ? `${homeData?.visitsThisMonth || 0} مرة` : `${homeData?.visitsThisMonth || 0} visits`}
          sub={lang === "ar" ? "هذا الشهر" : "this month"}
        />
        <OverviewCard
          icon={<Megaphone className="h-5 w-5" />}
          tone="gold"
          label={t("announcements")}
          value={lang === "ar" ? `${homeData?.unreadAnnouncements || 0} جديدة` : `${homeData?.unreadAnnouncements || 0} new`}
          sub={lang === "ar" ? "غير مقروءة" : "unread"}
        />
      </div>

      <Link
        to="/member/qr"
        className="mt-5 flex items-center justify-between rounded-2xl border border-dashed border-primary/30 bg-primary-soft/60 px-4 py-3 text-sm font-semibold text-primary"
      >
        {lang === "ar" ? "اعرض رمز QR الخاص بك" : "Show your QR code"}
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </Link>
    </div>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: "success" | "gold";
}) {
  const toneStyles =
    tone === "success"
      ? "bg-[color-mix(in_oklab,var(--color-success)_14%,transparent)] text-success"
      : "bg-gold-soft text-gold-foreground";
  return (
    <div className="rounded-2xl bg-card p-4 shadow-soft">
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${toneStyles}`}>{icon}</span>
      <p className="mt-3 text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-base font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}
