import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav, type NavItem } from "@/components/bottom-nav";
import { useLang } from "@/lib/i18n";
import { Home, QrCode, Bell, User } from "lucide-react";

export const Route = createFileRoute("/member")({
  component: MemberLayout,
});

function MemberLayout() {
  const { t } = useLang();
  const items: NavItem[] = [
    { to: "/member", label: t("home"), icon: Home },
    { to: "/member/qr", label: t("myQr"), icon: QrCode },
    { to: "/member/alerts", label: t("alerts"), icon: Bell },
    { to: "/member/profile", label: t("profile"), icon: User },
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
