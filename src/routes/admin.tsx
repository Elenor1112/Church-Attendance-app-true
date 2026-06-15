import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav, type NavItem } from "@/components/bottom-nav";
import { useLang } from "@/lib/i18n";
import { ScanLine, ClipboardList, MessageSquareText, Users, User } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { t } = useLang();
  const items: NavItem[] = [
    { to: "/admin", label: t("scanner"), icon: ScanLine },
    { to: "/admin/logs", label: t("attendanceLog"), icon: ClipboardList },
    { to: "/admin/comms", label: t("comms"), icon: MessageSquareText },
    { to: "/admin/members", label: t("members"), icon: Users },
    { to: "/admin/profile", label: t("profile"), icon: User },
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
