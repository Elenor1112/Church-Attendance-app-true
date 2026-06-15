import { ChevronDown, Search } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, Text, View } from "react-native";
import { AppScreen, AppText, Avatar, Card, ErrorState, LoadingState, PageHeader, StatusPill, TextField } from "@/components/ui";
import { useMembersQuery } from "@/features/queries";
import { useLang } from "@/lib/i18n";
import type { MemberStatus, Role } from "@/types";

const roleFilters: Array<Role | "all"> = ["all", "member", "admin", "super-admin"];
const statusFilters: Array<MemberStatus | "all"> = ["all", "approved", "pending", "rejected"];

export default function SuperMembersScreen() {
  const { t, lang } = useLang();
  const [role, setRole] = useState<Role | "all">("all");
  const [status, setStatus] = useState<MemberStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const query = useMembersQuery(role, status, search);

  if (query.isLoading) return <LoadingState label={t("loading")} />;
  if (query.isError) return <AppScreen><ErrorState message={String(query.error.message)} onRetry={() => query.refetch()} /></AppScreen>;

  return (
    <AppScreen contentClassName="pt-4" refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={query.refetch} />}>
      <PageHeader title={t("membersCenter")} subtitle={`${query.data?.length ?? 0}`} />
      <TextField placeholder={t("search")} value={search} onChangeText={setSearch} left={<Search size={17} color="#766a5f" />} />

      <Filter title={t("role")} values={roleFilters} value={role} onChange={setRole} labels={(item) => item === "all" ? t("all") : item === "super-admin" ? t("superAdmin") : item === "admin" ? t("admin") : t("member")} />
      <Filter title={t("status")} values={statusFilters} value={status} onChange={setStatus} labels={(item) => item === "all" ? t("all") : t(item)} />

      <View className="mt-5 gap-3">
        {query.data?.map((member) => {
          const expanded = open === member.id;
          const tone = member.status === "approved" ? "success" : member.status === "pending" ? "warning" : "destructive";
          return (
            <Card key={member.id} className="overflow-hidden rounded-2xl p-0">
              <View className="flex-row items-center gap-3 p-3" onTouchEnd={() => setOpen(expanded ? null : member.id)}>
                <Avatar initials={member.initials} size={40} gold={member.role !== "member"} />
                <View className="min-w-0 flex-1">
                  <AppText className="text-sm font-extrabold">{member.name[lang]}</AppText>
                  <View className="mt-1 flex-row items-center gap-2">
                    <Text className="text-[11px] text-muted-foreground">{member.role === "super-admin" ? t("superAdmin") : member.role === "admin" ? t("admin") : t("member")}</Text>
                    <StatusPill tone={tone}>{t(member.status)}</StatusPill>
                  </View>
                </View>
                <ChevronDown size={18} color="#766a5f" style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }} />
              </View>
              {expanded ? (
                <View className="border-t border-border bg-muted px-4 py-3">
                  <Row label={t("phone")} value={member.phone} />
                  <Row label={t("registeredOn")} value={member.registered} />
                  <Row label={t("approvedBy")} value={member.approvedBy?.[lang] ?? "-"} />
                  <Row label={t("scannedBy")} value={member.scannedBy?.[lang] ?? "-"} />
                  <Row label={t("lastAttendance")} value={member.lastAttendance?.[lang] ?? "-"} />
                  <AppText className="mt-2 text-[11px] font-extrabold uppercase" muted>{t("attendance")}</AppText>
                  {member.attendanceHistory.length ? (
                    member.attendanceHistory.map((log) => <Row key={log.id} label={log.date[lang]} value={log.time} />)
                  ) : (
                    <AppText className="py-1 text-xs" muted>-</AppText>
                  )}
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
    </AppScreen>
  );
}

function Filter<T extends string>({ title, values, value, onChange, labels }: { title: string; values: T[]; value: T; onChange: (value: T) => void; labels: (value: T) => string }) {
  return (
    <View>
      <AppText className="mt-4 px-1 text-[11px] font-extrabold uppercase" muted>{title}</AppText>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {values.map((item) => (
          <Text
            key={item}
            onPress={() => onChange(item)}
            className={`overflow-hidden rounded-full px-3 py-2 text-xs font-extrabold ${value === item ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
          >
            {labels(item)}
          </Text>
        ))}
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="text-xs font-extrabold text-foreground">{value}</Text>
    </View>
  );
}
