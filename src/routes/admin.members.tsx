import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { pendingRequests } from "@/lib/mock-data";
import { PageHeader, Avatar } from "@/components/app-shell";
import { UserPlus, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/members")({
  head: () => ({ meta: [{ title: "Members — Admin" }] }),
  component: MembersAdmin,
});

function MembersAdmin() {
  const { t, lang } = useLang();
  const [items, setItems] = useState(pendingRequests);

  const handle = (id: string) => setItems((arr) => arr.filter((m) => m.id !== id));

  return (
    <div>
      <PageHeader title={t("members")} subtitle={`${items.length} ${t("pendingRequests")}`} />

      <div className="px-5 pt-5">
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary-soft/50 text-sm font-semibold text-primary transition hover:bg-primary-soft">
          <UserPlus className="h-4 w-4" /> {t("addMember")}
        </button>

        <p className="mt-6 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("pendingRequests")}
        </p>

        <ul className="mt-2 space-y-3">
          {items.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد طلبات معلقة" : "No pending requests"}
            </li>
          ) : (
            items.map((m) => (
              <li key={m.id} className="rounded-2xl bg-card p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <Avatar initials={m.name[lang].split(" ").map((w) => w[0]).slice(0, 2).join("")} size={44} tone="gold" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{m.name[lang]}</p>
                    <p className="text-[11px] text-muted-foreground" dir="ltr">{m.phone}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {t("registeredOn")}: <span dir="ltr">{m.registered}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handle(m.id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-success py-2.5 text-xs font-semibold text-success-foreground transition hover:opacity-90"
                  >
                    <Check className="h-4 w-4" /> {t("approve")}
                  </button>
                  <button
                    onClick={() => handle(m.id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-destructive transition hover:bg-[color-mix(in_oklab,var(--color-destructive)_8%,transparent)]"
                  >
                    <X className="h-4 w-4" /> {t("reject")}
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
