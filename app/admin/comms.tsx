import { AlertTriangle, Cake, CheckCircle2, Search, Send } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { AppScreen, AppText, Avatar, Button, Card, ErrorState, LoadingState, PageHeader, StatusPill, TextField } from "@/components/ui";
import { useAdminCommsQuery, useSendAlertMutation } from "@/features/queries";
import { useLang } from "@/lib/i18n";

const tabs = ["birthdays", "sendAlerts", "receipts", "absences"] as const;

export default function CommsScreen() {
  const { t } = useLang();
  const [tab, setTab] = useState<(typeof tabs)[number]>("birthdays");
  const query = useAdminCommsQuery();

  if (query.isLoading) return <LoadingState label={t("loading")} />;
  if (query.isError) return <AppScreen><ErrorState message={String(query.error.message)} onRetry={() => query.refetch()} /></AppScreen>;

  return (
    <AppScreen contentClassName="pt-4">
      <PageHeader title={t("comms")} />
      <View className="flex-row gap-2">
        {tabs.map((item) => (
          <Text
            key={item}
            onPress={() => setTab(item)}
            numberOfLines={1}
            adjustsFontSizeToFit
            className={`overflow-hidden rounded-full px-3 py-2 text-xs font-extrabold ${tab === item ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
          >
            {t(item)}
          </Text>
        ))}
      </View>
      <View className="mt-5">
        {tab === "birthdays" ? <Birthdays data={query.data?.birthdays ?? []} /> : null}
        {tab === "sendAlerts" ? <SendAlerts members={query.data?.approvedMembers ?? []} /> : null}
        {tab === "receipts" ? <Receipts data={query.data?.receipts ?? []} /> : null}
        {tab === "absences" ? <Absences data={query.data?.absences ?? []} /> : null}
      </View>
    </AppScreen>
  );
}

function Birthdays({ data }: { data: NonNullable<ReturnType<typeof useAdminCommsQuery>["data"]>["birthdays"] }) {
  const { t, lang } = useLang();
  return (
    <View className="gap-3">
      {data.map((birthday) => (
        <Card key={birthday.id} className="flex-row items-center gap-3 rounded-2xl">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-gold-soft">
            <Cake size={22} color="#4d3712" />
          </View>
          <View className="min-w-0 flex-1">
            <AppText className="text-sm font-extrabold">{birthday.name[lang]}</AppText>
            <AppText className="text-[11px]" muted>{birthday.date[lang]}</AppText>
          </View>
          <View className="items-end">
            <Text className="text-base font-extrabold text-primary">{birthday.days}</Text>
            <Text className="text-[10px] text-muted-foreground">{t("daysLeft")}</Text>
          </View>
        </Card>
      ))}
    </View>
  );
}

function SendAlerts({ members }: { members: NonNullable<ReturnType<typeof useAdminCommsQuery>["data"]>["approvedMembers"] }) {
  const { t, lang } = useLang();
  const mutation = useSendAlertMutation();
  const [type, setType] = useState<"standard" | "custom">("standard");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(members.slice(0, 2).map((member) => member.id)));
  const filtered = useMemo(() => members.filter((member) => member.name.en.toLowerCase().includes(search.toLowerCase()) || member.name.ar.includes(search)), [members, search]);
  const allSelected = selected.size === members.length;

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const submit = async () => {
    try {
      await mutation.mutateAsync({ type, message: message || t("weeklyMeeting"), recipientIds: [...selected] });
      Alert.alert(t("sendAlerts"), `${selected.size} ${t("selected")}`);
      setMessage("");
    } catch (error) {
      Alert.alert(t("sendAlerts"), String(error));
    }
  };

  return (
    <View className="gap-4">
      <View className="flex-row rounded-2xl bg-card p-1 shadow-card">
        {(["standard", "custom"] as const).map((item) => (
          <Text
            key={item}
            onPress={() => setType(item)}
            className={`flex-1 overflow-hidden rounded-xl py-2 text-center text-xs font-extrabold ${type === item ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {item === "standard" ? t("standardAlert") : t("customAlert")}
          </Text>
        ))}
      </View>
      <TextInput
        multiline
        numberOfLines={3}
        value={message}
        onChangeText={setMessage}
        placeholder={t("writeMessage")}
        placeholderTextColor="#8a7b70"
        className="min-h-24 rounded-2xl border border-border bg-card p-4 text-sm text-foreground"
        textAlignVertical="top"
      />
      <TextField placeholder={t("search")} value={search} onChangeText={setSearch} left={<Search size={17} color="#766a5f" />} />
      <Card className="flex-row items-center justify-between rounded-2xl">
        <Text onPress={() => setSelected(allSelected ? new Set() : new Set(members.map((member) => member.id)))} className="text-sm font-extrabold text-foreground">
          {allSelected ? "☑" : "☐"} {t("selectAll")}
        </Text>
        <Text className="text-xs font-extrabold text-primary">{selected.size} {t("selected")}</Text>
      </Card>
      <View className="gap-2">
        {filtered.map((member) => (
          <Card key={member.id} className="flex-row items-center gap-3 rounded-2xl">
            <Text onPress={() => toggle(member.id)} className="text-lg text-primary">{selected.has(member.id) ? "☑" : "☐"}</Text>
            <Avatar initials={member.initials} size={36} />
            <View className="min-w-0 flex-1">
              <AppText className="text-sm font-extrabold">{member.name[lang]}</AppText>
              <Text className="text-[11px] text-muted-foreground">{member.phone}</Text>
            </View>
          </Card>
        ))}
      </View>
      <Button onPress={submit} disabled={mutation.isPending || selected.size === 0}>
        <Send size={17} color="#fffaf1" />
        <Text className="text-sm font-extrabold text-primary-foreground">{t("send")} ({selected.size})</Text>
      </Button>
    </View>
  );
}

function Receipts({ data }: { data: NonNullable<ReturnType<typeof useAdminCommsQuery>["data"]>["receipts"] }) {
  const { t, lang } = useLang();
  return (
    <View className="gap-3">
      {data.map((item) => {
        const pct = Math.round((item.read / item.total) * 100);
        return (
          <Card key={item.id} className="rounded-2xl">
            <View className="flex-row items-center justify-between">
              <AppText className="text-sm font-extrabold">{item.label[lang]}</AppText>
              <Text className="text-xs font-extrabold text-primary">{pct}%</Text>
            </View>
            <View className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <View className="h-full bg-primary" style={{ width: `${pct}%` }} />
            </View>
            <View className="mt-2 flex-row justify-between">
              <Text className="text-[11px] text-muted-foreground"><CheckCircle2 size={12} color="#2f9d68" /> {item.read} {t("read")}</Text>
              <Text className="text-[11px] text-muted-foreground">{item.total - item.read} {t("unread")}</Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

function Absences({ data }: { data: NonNullable<ReturnType<typeof useAdminCommsQuery>["data"]>["absences"] }) {
  const { t, lang } = useLang();
  return (
    <View className="gap-3">
      <View className="rounded-2xl border border-warning/30 bg-warning-soft p-4">
        <View className="flex-row gap-3">
          <AlertTriangle size={20} color="#d29526" />
          <View>
            <AppText className="text-sm font-extrabold">{t("fridayAbsences")}</AppText>
            <AppText className="text-xs" muted>{lang === "ar" ? "أعضاء يحتاجون متابعة" : "Members needing follow-up"}</AppText>
          </View>
        </View>
      </View>
      {data.map((item) => (
        <Card key={item.id} className="flex-row items-center gap-3 rounded-2xl">
          <Avatar initials={item.name.en.split(" ").map((p) => p[0]).join("").slice(0, 2)} size={40} />
          <View className="min-w-0 flex-1">
            <AppText className="text-sm font-extrabold">{item.name[lang]}</AppText>
            <AppText className="text-[11px]" muted>{t("lastAttendance")}: {item.last[lang]}</AppText>
          </View>
          <StatusPill tone="destructive">{item.streak} {t("consecutiveAbsences")}</StatusPill>
        </Card>
      ))}
    </View>
  );
}
