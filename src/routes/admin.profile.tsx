import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { PageHeader, Avatar, StatusPill } from "@/components/app-shell";
import { Camera, LogOut, Pencil } from "lucide-react";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({ meta: [{ title: "Admin Profile" }] }),
  component: AdminProfile,
});

function AdminProfile() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader title={t("profile")} />
      <div className="px-5 pt-6">
        <div className="flex flex-col items-center rounded-3xl bg-card p-6 shadow-card">
          <div className="relative">
            <Avatar initials="GS" size={96} tone="gold" />
            <button className="absolute -bottom-1 -end-1 grid h-9 w-9 place-items-center rounded-full border-4 border-card bg-primary text-primary-foreground shadow-soft" aria-label="Change picture">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mt-4 text-lg font-bold text-foreground">{lang === "ar" ? "أ. جورج صموئيل" : "Mr. George Samuel"}</h2>
          <p className="text-xs text-muted-foreground" dir="ltr">+20 100 222 4444</p>
          <div className="mt-3"><StatusPill tone="gold">{t("admin")}</StatusPill></div>
        </div>

        <button className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-start shadow-soft">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary"><Pencil className="h-4 w-4" /></span>
          <span className="text-sm font-semibold text-foreground">{t("editProfile")}</span>
        </button>

        <button
          onClick={() => navigate({ to: "/" })}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[color-mix(in_oklab,var(--color-destructive)_10%,transparent)] text-sm font-semibold text-destructive transition hover:bg-[color-mix(in_oklab,var(--color-destructive)_18%,transparent)]"
        >
          <LogOut className="h-4 w-4" /> {t("signOut")}
        </button>
      </div>
    </div>
  );
}
