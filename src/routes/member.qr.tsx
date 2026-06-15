import { createFileRoute } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { useLang } from "@/lib/i18n";
import { currentUser } from "@/lib/mock-data";
import { PageHeader, StatusPill } from "@/components/app-shell";
import { LanguageToggle } from "@/components/language-toggle";
import { Download, Share2 } from "lucide-react";

export const Route = createFileRoute("/member/qr")({
  head: () => ({ meta: [{ title: "My QR Code" }] }),
  component: MyQr,
});

function MyQr() {
  const { t, lang } = useLang();
  return (
    <div>
      <PageHeader title={t("myQr")} subtitle={lang === "ar" ? "للحضور السريع" : "Quick check-in"} right={<LanguageToggle subtle />} />

      <div className="px-5 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-card p-6 shadow-elevated">
          <div className="absolute inset-x-0 top-0 h-1 gold-gradient" aria-hidden />

          <div className="flex flex-col items-center text-center">
            <StatusPill tone="gold">{t("active")}</StatusPill>
            <div className="mt-5 rounded-3xl border border-border bg-background p-5">
              <QRCodeSVG
                value={`church-mb-${currentUser.phone}`}
                size={220}
                level="H"
                bgColor="transparent"
                fgColor="oklch(0.22 0.05 25)"
              />
            </div>
            <h2 className="mt-5 text-lg font-bold text-foreground">{currentUser.name[lang]}</h2>
            <p className="text-xs text-muted-foreground" dir="ltr">{currentUser.phone}</p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">{t("showQr")}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-foreground transition hover:bg-secondary">
            <Download className="h-4 w-4" /> {lang === "ar" ? "حفظ" : "Save"}
          </button>
          <button className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-foreground transition hover:bg-secondary">
            <Share2 className="h-4 w-4" /> {lang === "ar" ? "مشاركة" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
