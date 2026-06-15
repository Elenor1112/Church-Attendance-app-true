import { useLang } from "@/lib/i18n";
import { Languages } from "lucide-react";

export function LanguageToggle({ subtle = false }: { subtle?: boolean }) {
  const { lang, toggle } = useLang();
  return (
    <button
      type="button"
      onClick={toggle}
      className={
        subtle
          ? "inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground hover:border-foreground/30"
          : "inline-flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-soft backdrop-blur transition hover:bg-card"
      }
      aria-label="Toggle language"
    >
      <Languages className="h-3.5 w-3.5" />
      {lang === "ar" ? "EN" : "ع"}
    </button>
  );
}
