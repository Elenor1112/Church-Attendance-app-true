import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav, type NavItem } from "@/components/bottom-nav";
import { useLang } from "@/lib/i18n";
import { LayoutDashboard, Users, User } from "lucide-react";

export const Route = createFileRoute("/super")({
  component: SuperLayout,
});

function SuperLayout() {
  const { t } = useLang();
  const items: NavItem[] = [
    { to: "/super", label: t("dashboard"), icon: LayoutDashboard },
    { to: "/super/members", label: t("membersCenter"), icon: Users },
    { to: "/super/profile", label: t("profile"), icon: User },
  ];
  return (
    <div className="app-shell flex min-h-dvh flex-col">
      <div className="flex-1 pb-2">
        <Outlet />
      </div>
      <BottomNav items={items} />
    </div>
  );
}
