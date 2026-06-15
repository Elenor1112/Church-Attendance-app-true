import { Search } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, Text, View } from "react-native";
import { AppScreen, AppText, Avatar, ErrorState, LoadingState, PageHeader, StatusPill, TextField } from "@/components/ui";
import { useAttendanceLogsQuery } from "@/features/queries";
import { useLang } from "@/lib/i18n";

const filters = ["today", "thisWeek", "all"] as const;

export default function LogsScreen() {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<(typeof filters)[number]>("today");
  const [search, setSearch] = useState("");
  const query = useAttendanceLogsQuery(filter, search);

  if (query.isLoading) return <LoadingState label={t("loading")} />;
  if (query.isError) return <AppScreen><ErrorState message={String(query.error.message)} onRetry={() => query.refetch()} /></AppScreen>;

  return (
    <AppScreen contentClassName="pt-4" refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={query.refetch} />}>
      <PageHeader title={t("attendanceLog")} subtitle={`${query.data?.length ?? 0} ${lang === "ar" ? "سجل" : "records"}`} />
      <TextField placeholder={t("search")} value={search} onChangeText={setSearch} left={<Search size={17} color="#766a5f" />} />
      <View className="mt-3 flex-row gap-2">
        {filters.map((item) => (
          <Text
            key={item}
            onPress={() => setFilter(item)}
            className={`overflow-hidden rounded-full px-4 py-2 text-xs font-extrabold ${filter === item ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
          >
            {t(item)}
          </Text>
        ))}
      </View>
      <View className="mt-4 gap-3">
        {query.data?.map((log) => (
          <View key={log.id} className="flex-row items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
            <Avatar initials={log.name.en.split(" ").map((p) => p[0]).join("").slice(0, 2)} size={40} />
            <View className="min-w-0 flex-1">
              <AppText className="text-sm font-extrabold">{log.name[lang]}</AppText>
              <Text className="text-[11px] text-muted-foreground">{log.date[lang]} · {log.time}</Text>
            </View>
            <StatusPill tone={log.status === "on-time" ? "success" : "warning"}>
              {log.status === "on-time" ? (lang === "ar" ? "في الموعد" : "On time") : lang === "ar" ? "متأخر" : "Late"}
            </StatusPill>
          </View>
        ))}
      </View>
    </AppScreen>
  );
}
