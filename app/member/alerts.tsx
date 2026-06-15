import { Bell, BellOff, Cake, Calendar, CheckCircle2, Megaphone } from "lucide-react-native";
import { RefreshControl, Text, View } from "react-native";
import { AppScreen, AppText, EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";
import { useClearNotificationsMutation, useNotificationsQuery } from "@/features/queries";
import { useLang } from "@/lib/i18n";

const icons = [Calendar, Cake, CheckCircle2, Megaphone];

export default function AlertsScreen() {
  const { t, lang } = useLang();
  const query = useNotificationsQuery();
  const clear = useClearNotificationsMutation();
  const unread = query.data?.filter((item) => item.unread).length ?? 0;

  if (query.isLoading) return <LoadingState label={t("loading")} />;
  if (query.isError) return <AppScreen><ErrorState message={String(query.error.message)} onRetry={() => query.refetch()} /></AppScreen>;

  return (
    <AppScreen
      contentClassName="pt-4"
      refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={query.refetch} />}
    >
      <PageHeader
        title={t("alerts")}
        subtitle={lang === "ar" ? `${unread} إشعار غير مقروء` : `${unread} unread`}
        right={
          query.data?.length ? (
            <Text onPress={() => clear.mutate()} className="text-xs font-extrabold text-primary">
              {t("clearAll")}
            </Text>
          ) : null
        }
      />

      {!query.data?.length ? (
        <EmptyState icon={BellOff} title={t("noAlerts")} body={t("noAlertsDesc")} />
      ) : (
        <View className="gap-3">
          {query.data.map((item, index) => {
            const Icon = icons[index % icons.length] ?? Bell;
            return (
              <View key={item.id} className={`rounded-2xl border bg-card p-4 shadow-card ${item.unread ? "border-primary/20" : "border-border"}`}>
                <View className="flex-row gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
                    <Icon size={20} color="#6b1f1f" />
                  </View>
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-start justify-between gap-2">
                      <AppText className="flex-1 text-sm font-extrabold">{item.title[lang]}</AppText>
                      <Text className="text-[11px] text-muted-foreground">{item.time[lang]}</Text>
                    </View>
                    <AppText className="mt-1 text-xs leading-5" muted>{item.body[lang]}</AppText>
                  </View>
                  {item.unread ? <View className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" /> : null}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </AppScreen>
  );
}
