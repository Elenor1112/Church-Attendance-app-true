import { Tabs } from "expo-router";
import { LayoutDashboard, User, Users } from "lucide-react-native";
import { LoadingState } from "@/components/ui";
import { useRequireRole } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

export default function SuperLayout() {
  const { ready } = useRequireRole("super-admin");
  const { t } = useLang();
  if (!ready) return <LoadingState label={t("loading")} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6b1f1f",
        tabBarInactiveTintColor: "#766a5f",
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#eadfce", height: 68, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("dashboard"), tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} /> }} />
      <Tabs.Screen name="members" options={{ title: t("membersCenter"), tabBarIcon: ({ color }) => <Users size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: t("profile"), tabBarIcon: ({ color }) => <User size={22} color={color} /> }} />
    </Tabs>
  );
}
