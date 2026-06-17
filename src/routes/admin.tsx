import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { BottomNav, type NavItem } from "@/components/bottom-nav";
import { useLang } from "@/lib/i18n";
import { ScanLine, ClipboardList, MessageSquareText, Users, User, BarChart3 } from "lucide-react";
import { getSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { t } = useLang();
  const navigate = useNavigate();
  const session = getSession();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!session) { navigate({ to: "/" }); return; }
    // super-admin gets all perms; for admin, load from session or me endpoint
    if (session.user.role === "super-admin") {
      setPermissions(["scan", "view_logs", "send_messages", "generate_reports"]);
      setLoaded(true);
    } else if (session.user.role === "admin") {
      // Permissions were returned in the login response and stored in session if available,
      // otherwise load from /api/auth/me
      const sessionPerms = (session.user as any).permissions;
      if (Array.isArray(sessionPerms)) {
        setPermissions(sessionPerms);
        setLoaded(true);
      } else {
        fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        })
          .then((r) => r.json())
          .then((d) => { setPermissions(d.permissions ?? []); })
          .finally(() => setLoaded(true));
      }
    } else {
      navigate({ to: "/" });
    }
  }, []);

  const allItems: (NavItem & { permission?: string })[] = [
    { to: "/admin", label: t("scanner"), icon: ScanLine, permission: "scan" },
    { to: "/admin/logs", label: t("attendanceLog"), icon: ClipboardList, permission: "view_logs" },
    { to: "/admin/comms", label: t("comms"), icon: MessageSquareText, permission: "send_messages" },
    { to: "/admin/reports", label: t("reports" as any), icon: BarChart3, permission: "generate_reports" },
    { to: "/admin/members", label: t("members"), icon: Users },
    { to: "/admin/profile", label: t("profile"), icon: User },
  ];

  const visibleItems: NavItem[] = allItems.filter(
    (item) => !item.permission || permissions.includes(item.permission),
  );

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">{t("loading" as any)}</p>
      </div>
    );
  }

  return (
    <div className="app-shell flex min-h-dvh flex-col">
      <div className="flex-1 pb-2">
        <Outlet context={{ permissions }} />
      </div>
      <BottomNav items={visibleItems} />
    </div>
  );
}
