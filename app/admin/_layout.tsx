import { Tabs } from "expo-router";
import { ClipboardList, MessageSquareText, ScanLine, User, Users } from "lucide-react-native";
import { LoadingState } from "@/components/ui";
import { useRequireRole } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

export default function AdminLayout() {
  const { ready } = useRequireRole("admin");
  const { t } = useLang();
  if (!ready) return <LoadingState label={t("loading")} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6b1f1f",
        tabBarInactiveTintColor: "#766a5f",
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#eadfce", height: 68, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("scanner"), tabBarIcon: ({ color }) => <ScanLine size={22} color={color} /> }} />
      <Tabs.Screen name="logs" options={{ title: t("attendanceLog"), tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} /> }} />
      <Tabs.Screen name="comms" options={{ title: t("comms"), tabBarIcon: ({ color }) => <MessageSquareText size={22} color={color} /> }} />
      <Tabs.Screen name="members" options={{ title: t("members"), tabBarIcon: ({ color }) => <Users size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: t("profile"), tabBarIcon: ({ color }) => <User size={22} color={color} /> }} />
    </Tabs>
  );
}
