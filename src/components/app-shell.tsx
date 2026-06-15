import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("app-shell flex flex-col", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
  left,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  left?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 px-5 pb-4 pt-5 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {left}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
    </header>
  );
}

export function StatusPill({
  tone = "neutral",
  children,
  dot = true,
}: {
  tone?: "success" | "warning" | "destructive" | "gold" | "neutral";
  children: ReactNode;
  dot?: boolean;
}) {
  const tones: Record<string, string> = {
    success: "bg-[color-mix(in_oklab,var(--color-success)_14%,transparent)] text-success",
    warning: "bg-[color-mix(in_oklab,var(--color-warning)_18%,transparent)] text-warning-foreground",
    destructive: "bg-[color-mix(in_oklab,var(--color-destructive)_12%,transparent)] text-destructive",
    gold: "bg-gold-soft text-gold-foreground",
    neutral: "bg-muted text-muted-foreground",
  };
  const dotTones: Record<string, string> = {
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
    gold: "bg-gold",
    neutral: "bg-muted-foreground/60",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotTones[tone]}`} />}
      {children}
    </span>
  );
}

export function Avatar({ initials, size = 40, tone = "primary" }: { initials: string; size?: number; tone?: "primary" | "gold" }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${tone === "primary" ? "primary-gradient text-primary-foreground" : "gold-gradient text-gold-foreground"}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}
