import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { PageHeader, Avatar, StatusPill } from "@/components/app-shell";
import { Camera, LogOut, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/super/profile")({
  head: () => ({ meta: [{ title: "Super Admin Profile" }] }),
  component: SuperProfile,
});

function SuperProfile() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader title={t("profile")} />
      <div className="px-5 pt-6">
        <div className="flex flex-col items-center rounded-3xl bg-card p-6 shadow-card">
          <div className="relative">
            <Avatar initials="MH" size={96} />
            <button className="absolute -bottom-1 -end-1 grid h-9 w-9 place-items-center rounded-full border-4 border-card bg-gold text-gold-foreground shadow-soft" aria-label="Change picture">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mt-4 text-lg font-bold text-foreground">{lang === "ar" ? "د. مرقس حنا" : "Dr. Marcus Hanna"}</h2>
          <p className="text-xs text-muted-foreground" dir="ltr">+20 100 222 6666</p>
          <div className="mt-3 inline-flex items-center gap-1.5">
            <StatusPill tone="gold"><ShieldCheck className="h-3 w-3" />{t("superAdmin")}</StatusPill>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[color-mix(in_oklab,var(--color-destructive)_10%,transparent)] text-sm font-semibold text-destructive transition hover:bg-[color-mix(in_oklab,var(--color-destructive)_18%,transparent)]"
          >
            <LogOut className="h-4 w-4" /> {t("signOut")}
          </button>
        </div>
      </div>
    </div>
  );
}
