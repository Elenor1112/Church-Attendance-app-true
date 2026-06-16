import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { PageHeader, Avatar, StatusPill } from "@/components/app-shell";
import { Pencil, Phone, Mail, Cake, LogOut, ChevronRight, Camera, Trophy } from "lucide-react";
import { getSession, authenticatedFetch, clearSession } from "@/lib/auth-client";

type CategoryKey = "contemporary_issues" | "bible_study" | "spirituality" | "saints_lives";
const CATEGORY_KEYS: CategoryKey[] = ["contemporary_issues", "bible_study", "spirituality", "saints_lives"];
const CATEGORY_ICONS: Record<CategoryKey, string> = {
  contemporary_issues: "💬",
  bible_study: "📖",
  spirituality: "🕊️",
  saints_lives: "✨",
};

export const Route = createFileRoute("/member/profile")({
  head: () => ({ meta: [{ title: "My Profile" }] }),
  component: Profile,
});

function Profile() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const session = getSession();
  const [userData, setUserData] = useState<any>(null);
  const [setProgress, setSetProgress] = useState<Set<CategoryKey>>(new Set());

  useEffect(() => {
    if (!session) { navigate({ to: "/" }); return; }
    const load = async () => {
      try {
        const [meRes, logsRes] = await Promise.all([
          authenticatedFetch("/api/auth/me"),
          authenticatedFetch("/api/attendance"),
        ]);
        if (meRes.ok) setUserData(await meRes.json());
        if (logsRes.ok) {
          const logs: any[] = await logsRes.json();
          const userLogs = logs.filter((l) => l.memberId === session.user.id && l.fridayCategory);
          // Track categories since last reset (simplified: just use all user logs)
          const cats = new Set(userLogs.map((l: any) => l.fridayCategory as CategoryKey).filter(Boolean));
          setSetProgress(cats);
        }
      } catch {}
    };
    load();
  }, []);

  const currentUser = session?.user;
  const completedSets = userData?.completedSets ?? 0;

  const handleSignOut = () => {
    clearSession();
    navigate({ to: "/" });
  };

  if (!currentUser) return null;

  return (
    <div>
      <PageHeader title={t("profile")} />

      <div className="px-5 pt-6">
        <div className="flex flex-col items-center rounded-3xl bg-card p-6 shadow-card">
          <div className="relative">
            <Avatar initials={currentUser.initials} size={96} />
            <button
              type="button"
              aria-label="Change picture"
              className="absolute -bottom-1 -end-1 grid h-9 w-9 place-items-center rounded-full border-4 border-card bg-gold text-gold-foreground shadow-soft"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mt-4 text-lg font-bold text-foreground">{currentUser.name[lang]}</h2>
          <p className="text-xs text-muted-foreground" dir="ltr">{currentUser.phone}</p>
          <div className="mt-3">
            <StatusPill tone="success">{t("approved")}</StatusPill>
          </div>
        </div>

        {/* Friday Set Progress */}
        <div className="mt-5 rounded-2xl bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{t("currentSetProgress")}</p>
            <span className="flex items-center gap-1 text-xs font-semibold text-gold-foreground">
              <Trophy className="h-3.5 w-3.5" />
              {t("completedSets")}: {completedSets}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{t("setProgressDesc")}</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {CATEGORY_KEYS.map((key) => {
              const done = setProgress.has(key);
              const catLabel = {
                contemporary_issues: t("contemporaryIssues"),
                bible_study: t("bibleStudy"),
                spirituality: t("spirituality"),
                saints_lives: t("saintsLives"),
              }[key];
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 text-center transition ${
                    done
                      ? "bg-[color-mix(in_oklab,var(--color-success)_16%,transparent)] text-success"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <span className="text-lg">{CATEGORY_ICONS[key]}</span>
                  <p className="text-[9px] font-medium leading-tight">{catLabel}</p>
                  {done && <span className="text-[10px]">✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-6 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("personalInfo")}
        </p>
        <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-soft">
          <InfoRow icon={Phone} label={t("phone")} value={currentUser.phone} ltr />
          {currentUser.birthday && <InfoRow icon={Cake} label={t("birthday")} value={currentUser.birthday} ltr />}
          {currentUser.email && <InfoRow icon={Mail} label={t("email")} value={currentUser.email} ltr />}
        </div>

        <div className="mt-5 space-y-2">
          <ActionRow icon={Phone} label={t("changePhone")} />
          <ActionRow icon={Pencil} label={t("editProfile")} />
        </div>

        <button
          onClick={handleSignOut}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[color-mix(in_oklab,var(--color-destructive)_10%,transparent)] text-sm font-semibold text-destructive transition hover:bg-[color-mix(in_oklab,var(--color-destructive)_18%,transparent)]"
        >
          <LogOut className="h-4 w-4" /> {t("signOut")}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, ltr }: { icon: typeof Phone; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground" dir={ltr ? "ltr" : undefined}>{value}</p>
      </div>
    </div>
  );
}

function ActionRow({ icon: Icon, label }: { icon: typeof Phone; label: string }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3 text-start shadow-soft transition hover:bg-secondary">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 text-sm font-semibold text-foreground">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
    </button>
  );
}
