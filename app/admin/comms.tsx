import { AlertTriangle, Cake, CheckCircle2, Search, Send } from "lucide-react-native";
import { useMemo, useState, useEffect } from "react";
import { Alert, Text, TextInput, View, Pressable } from "react-native";
import { AppScreen, AppText, Avatar, Button, Card, ErrorState, LoadingState, PageHeader, StatusPill, TextField } from "@/components/ui";
import { useAdminCommsQuery, useSendAlertMutation } from "@/features/queries";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { SetNotification } from "@/types";

const tabs = ["birthdays", "sendAlerts", "receipts", "absences", "setCompletions"] as const;

export default function CommsScreen() {
  const { t } = useLang();
  const [tab, setTab] = useState<(typeof tabs)[number]>("birthdays");
  const [setNotifs, setSetNotifs] = useState<SetNotification[]>([]);
  const query = useAdminCommsQuery();

  useEffect(() => {
    api.setNotifications().then(setSetNotifs).catch(() => {});
  }, []);

  if (query.isLoading) return <LoadingState label={t("loading" as any)} />;
  if (query.isError) return <AppScreen><ErrorState message={String(query.error.message)} onRetry={() => query.refetch()} /></AppScreen>;

  const pendingCount = setNotifs.length;

  return (
    <AppScreen contentClassName="pt-4">
      <PageHeader title={t("comms")} />
      <View className="flex-row flex-wrap gap-2">
        {tabs.map((item) => (
          <View key={item} className="relative">
            <Text
              onPress={() => setTab(item)}
              numberOfLines={1}
              adjustsFontSizeToFit
              className={`overflow-hidden rounded-full px-3 py-2 text-xs font-extrabold ${tab === item ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
            >
              {t(item as any)}
            </Text>
            {item === "setCompletions" && pendingCount > 0 && (
              <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-destructive">
                <Text className="text-[9px] font-bold text-white">{pendingCount}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
      <View className="mt-5">
        {tab === "birthdays" ? <Birthdays data={query.data?.birthdays ?? []} /> : null}
        {tab === "sendAlerts" ? <SendAlerts members={query.data?.approvedMembers ?? []} /> : null}
        {tab === "receipts" ? <Receipts data={query.data?.receipts ?? []} /> : null}
        {tab === "absences" ? <Absences data={query.data?.absences ?? []} /> : null}
        {tab === "setCompletions" ? <SetCompletions notifs={setNotifs} setNotifs={setSetNotifs} /> : null}
      </View>
    </AppScreen>
  );
}

function Birthdays({ data }: { data: any[] }) {
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

function SendAlerts({ members }: { members: any[] }) {
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
        <Text onPress={() => setSelected(allSelected ? new Set() : new Set(members.map((member: any) => member.id)))} className="text-sm font-extrabold text-foreground">
          {allSelected ? "☑" : "☐"} {t("selectAll")}
        </Text>
        <Text className="text-xs font-extrabold text-primary">{selected.size} {t("selected")}</Text>
      </Card>
      <View className="gap-2">
        {filtered.map((member: any) => (
          <Card key={member.id} className="flex-row items-center gap-3 rounded-2xl">
            <Text onPress={() => toggle(member.id)} className="text-lg text-primary">{selected.has(member.id) ? "☑" : "☐"}</Text>
            <Avatar initials={member.initials ?? member.name.en.slice(0, 2)} size={36} />
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

function Receipts({ data }: { data: any[] }) {
  const { t, lang } = useLang();
  const fallback = [
    { id: "r1", label: { ar: "تذكير الاجتماع", en: "Meeting reminder" }, read: 38, total: 50 },
    { id: "r2", label: { ar: "إعلان قداس الأحد", en: "Sunday Liturgy" }, read: 22, total: 50 },
  ];
  const receipts = data.length > 0 ? data : fallback;
  return (
    <View className="gap-3">
      {receipts.map((item: any) => {
        const pct = Math.round((item.read / (item.total || 1)) * 100);
        return (
          <Card key={item.id} className="rounded-2xl">
            <View className="flex-row items-center justify-between">
              <AppText className="text-sm font-extrabold">{item.label?.[lang] || item.title?.[lang]}</AppText>
              <Text className="text-xs font-extrabold text-primary">{pct}%</Text>
            </View>
            <View className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <View className="h-full bg-primary" style={{ width: `${pct}%` }} />
            </View>
            <View className="mt-2 flex-row justify-between">
              <Text className="text-[11px] text-muted-foreground">{item.read} {t("read")}</Text>
              <Text className="text-[11px] text-muted-foreground">{(item.total || 0) - item.read} {t("unread")}</Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

function Absences({ data }: { data: any[] }) {
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
      {data.map((item: any) => (
        <Card key={item.id} className="flex-row items-center gap-3 rounded-2xl">
          <Avatar initials={item.name.en.split(" ").map((p: string) => p[0]).join("").slice(0, 2)} size={40} />
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

function SetCompletions({ notifs, setNotifs }: { notifs: SetNotification[]; setNotifs: (n: SetNotification[]) => void }) {
  const { t, lang } = useLang();
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const handleAcknowledge = async (id: string) => {
    setAcknowledging(id);
    try {
      await api.acknowledgeSetNotification(id);
      setNotifs(notifs.filter((n) => n.id !== id));
      Alert.alert(t("acknowledged" as any), lang === "ar" ? "تم الإقرار بنجاح" : "Set acknowledged successfully");
    } catch {
      Alert.alert(lang === "ar" ? "خطأ" : "Error", lang === "ar" ? "فشل الإقرار" : "Failed to acknowledge");
    }
    setAcknowledging(null);
  };

  if (notifs.length === 0) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-4xl">🎁</Text>
        <AppText className="mt-3 text-sm font-extrabold">
          {lang === "ar" ? "لا توجد مجموعات معلقة" : "No pending set completions"}
        </AppText>
        <AppText className="mt-1 text-xs" muted>
          {lang === "ar" ? "ستظهر هنا عند اكتمال مجموعة" : "They'll appear here when a member completes a set"}
        </AppText>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {notifs.map((n) => (
        <Card key={n.id} className="rounded-2xl">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-gold-soft">
              <Text className="text-2xl">🎁</Text>
            </View>
            <View className="min-w-0 flex-1">
              <AppText className="text-sm font-extrabold">{n.memberName[lang]}</AppText>
              <AppText className="text-[11px]" muted>{t("setCompleted" as any)}</AppText>
              <Text className="text-[10px] text-gold-foreground">
                {lang === "ar" ? `المجموعات: ${n.completedSets + 1}` : `Sets: ${n.completedSets + 1}`}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => handleAcknowledge(n.id)}
            disabled={acknowledging === n.id}
            className="mt-3 flex-row items-center gap-2 rounded-xl border border-border px-3 py-2"
          >
            <Text className="text-lg text-primary">{acknowledging === n.id ? "⏳" : "☐"}</Text>
            <AppText className="text-sm font-semibold">
              {acknowledging === n.id ? (lang === "ar" ? "جاري..." : "Processing...") : t("acknowledge" as any)}
            </AppText>
          </Pressable>
        </Card>
      ))}
    </View>
  );
}
