import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { currentUser } from "@/lib/mock-data";
import { PageHeader, Avatar, StatusPill } from "@/components/app-shell";
import { Pencil, Phone, Mail, Cake, LogOut, ChevronRight, Camera } from "lucide-react";

export const Route = createFileRoute("/member/profile")({
  head: () => ({ meta: [{ title: "My Profile" }] }),
  component: Profile,
});

function Profile() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
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

        <p className="mt-6 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("personalInfo")}
        </p>
        <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-soft">
          <InfoRow icon={Phone} label={t("phone")} value={currentUser.phone} ltr />
          <InfoRow icon={Cake} label={t("birthday")} value={currentUser.birthday} ltr />
          <InfoRow icon={Mail} label={t("email")} value={currentUser.email} ltr />
        </div>

        <div className="mt-5 space-y-2">
          <ActionRow icon={Phone} label={t("changePhone")} />
          <ActionRow icon={Pencil} label={t("editProfile")} />
        </div>

        <button
          onClick={() => navigate({ to: "/" })}
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
        <p className="truncate text-sm font-semibold text-foreground" dir={ltr ? "ltr" : undefined}>
          {value}
        </p>
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
