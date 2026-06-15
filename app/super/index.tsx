import { Link } from "expo-router";
import { ChevronRight, Clock3, ScanLine, TrendingUp, UserCog, Users } from "lucide-react-native";
import { RefreshControl, Text, View } from "react-native";
import { AppScreen, AppText, Avatar, Card, ErrorState, GradientCard, LanguageToggle, LoadingState, PageHeader, StatusPill } from "@/components/ui";
import { useDashboardQuery } from "@/features/queries";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

export default function SuperDashboardScreen() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const query = useDashboardQuery();

  if (query.isLoading) return <LoadingState label={t("loading")} />;
  if (query.isError) return <AppScreen><ErrorState message={String(query.error.message)} onRetry={() => query.refetch()} /></AppScreen>;

  const stats = query.data?.stats;

  return (
    <AppScreen contentClassName="pt-4" refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={query.refetch} />}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Avatar initials={user?.initials ?? "MH"} uri={user?.photoUri} />
          <View>
            <AppText className="text-[11px]" muted>{lang === "ar" ? "مرحبا" : "Hello"}</AppText>
            <AppText className="text-sm font-extrabold">{user?.name[lang]}</AppText>
          </View>
        </View>
        <View className="items-end gap-2">
          <StatusPill tone="gold">{t("superAdmin")}</StatusPill>
          <LanguageToggle subtle />
        </View>
      </View>

      <GradientCard className="mt-6">
        <Text className="text-[11px] font-extrabold uppercase text-gold-soft">{t("dashboard")}</Text>
        <View className="mt-3 flex-row items-end justify-between">
          <View>
            <Text className="text-4xl font-extrabold text-primary-foreground">{stats?.totalMembers}</Text>
            <Text className="mt-1 text-xs text-primary-foreground/80">{t("registeredMembers")}</Text>
          </View>
          <View className="flex-row items-center gap-1 rounded-full bg-white/15 px-3 py-1">
            <TrendingUp size={13} color="#fff2c7" />
            <Text className="text-xs font-extrabold text-gold-soft">+12 {lang === "ar" ? "هذا الشهر" : "this month"}</Text>
          </View>
        </View>
      </GradientCard>

      <View className="mt-4 flex-row gap-3">
        <Kpi icon={Users} value={String(stats?.totalMembers ?? 0)} label={t("totalMembers")} />
        <Kpi icon={UserCog} value={String(stats?.totalAdmins ?? 0)} label={t("totalAdmins")} gold />
      </View>
      <View className="mt-3 flex-row gap-3">
        <Kpi icon={ScanLine} value={String(stats?.todayCheckIns ?? 0)} label={t("todayCheckIns")} />
        <Kpi icon={Clock3} value={String(stats?.pendingApprovals ?? 0)} label={t("pendingApprovals")} warning />
      </View>

      <Card className="mt-5 rounded-2xl">
        <View className="flex-row items-center justify-between">
          <AppText className="text-sm font-extrabold">{t("recentActivity")}</AppText>
          <Link href="/super/members" asChild>
            <Text className="text-[11px] font-extrabold text-primary">{t("all")} <ChevronRight size={12} color="#6b1f1f" /></Text>
          </Link>
        </View>
        <View className="mt-3 gap-3">
          {query.data?.recentActivity.map((activity) => (
            <View key={activity.id} className="flex-row gap-3">
              <View className="mt-2 h-2 w-2 rounded-full bg-gold" />
              <View className="flex-1">
                <AppText className="text-sm">{activity.text[lang]}</AppText>
                <AppText className="text-[11px]" muted>{activity.time[lang]}</AppText>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </AppScreen>
  );
}

function Kpi({ icon: Icon, value, label, gold = false, warning = false }: { icon: typeof Users; value: string; label: string; gold?: boolean; warning?: boolean }) {
  return (
    <Card className="flex-1 rounded-2xl">
      <View className={`h-9 w-9 items-center justify-center rounded-xl ${warning ? "bg-warning-soft" : gold ? "bg-gold-soft" : "bg-primary-soft"}`}>
        <Icon size={20} color={warning ? "#d29526" : gold ? "#4d3712" : "#6b1f1f"} />
      </View>
      <AppText className="mt-3 text-2xl font-extrabold">{value}</AppText>
      <AppText className="text-[11px]" muted>{label}</AppText>
    </Card>
  );
}
