import { Link } from "expo-router";
import { Bell, BookOpen, CalendarDays, CheckCircle2, ChevronRight, Clock, MapPin, Megaphone, QrCode } from "lucide-react-native";
import { RefreshControl, Text, View } from "react-native";
import { AppScreen, AppText, Avatar, Card, ErrorState, GradientCard, LanguageToggle, LoadingState, OfflineBanner, StatusPill } from "@/components/ui";
import { useMemberHomeQuery } from "@/features/queries";
import { useAuth } from "@/lib/auth";
import { useOnlineStatus } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";

export default function MemberHome() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const query = useMemberHomeQuery();
  const online = useOnlineStatus();

  if (query.isLoading) return <LoadingState label={t("loading")} />;
  if (query.isError) return <AppScreen><ErrorState message={String(query.error.message)} onRetry={() => query.refetch()} /></AppScreen>;

  const data = query.data;

  return (
    <AppScreen
      contentClassName="pt-4"
      refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={query.refetch} />}
    >
      {!online ? <OfflineBanner /> : null}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Avatar initials={user?.initials ?? "MA"} uri={user?.photoUri} />
          <View>
            <AppText className="text-[11px]" muted>{t("welcome")}</AppText>
            <AppText className="text-sm font-extrabold">{user?.name[lang]}</AppText>
          </View>
        </View>
        <View className="items-end gap-2">
          <StatusPill tone="success">{t("approved")}</StatusPill>
          <LanguageToggle subtle />
        </View>
      </View>

      <GradientCard className="mt-6">
        <View className="flex-row items-center gap-2">
          <BookOpen size={16} color="#fff2c7" />
          <Text className="text-xs font-extrabold uppercase text-gold-soft">{t("verseOfDay")}</Text>
        </View>
        <Text className="mt-3 text-base font-semibold leading-7 text-primary-foreground" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
          {data?.verse[lang]}
        </Text>
        <Text className="mt-3 text-xs font-extrabold text-gold-soft">- {data?.verse.ref[lang]}</Text>
      </GradientCard>

      <Card className="mt-5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <AppText className="text-[11px] font-extrabold uppercase text-gold-foreground">{t("weeklyMeeting")}</AppText>
            <AppText className="mt-1 text-base font-extrabold">{data?.meeting.title[lang]}</AppText>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft">
            <CalendarDays size={22} color="#4d3712" />
          </View>
        </View>
        <View className="mt-4 gap-2">
          <Info icon={CalendarDays} label={data?.meeting.date[lang] ?? ""} />
          <Info icon={Clock} label={data?.meeting.time[lang] ?? ""} />
          <Info icon={MapPin} label={data?.meeting.location[lang] ?? ""} />
        </View>
      </Card>

      <View className="mt-5 flex-row gap-3">
        <Overview icon={CheckCircle2} label={t("attendance")} value={lang === "ar" ? "١٢ مرة" : "12 visits"} sub={lang === "ar" ? "هذا الشهر" : "this month"} />
        <Overview icon={Megaphone} label={t("announcements")} value={`${data?.unreadAnnouncements ?? 0}`} sub={lang === "ar" ? "غير مقروءة" : "unread"} gold />
      </View>

      <Link href="/member/qr" asChild>
        <View className="mt-5 flex-row items-center justify-between rounded-2xl border border-primary/20 bg-primary-soft px-4 py-3">
          <View className="flex-row items-center gap-2">
            <QrCode size={18} color="#6b1f1f" />
            <Text className="text-sm font-extrabold text-primary">{lang === "ar" ? "اعرض رمز QR الخاص بك" : "Show your QR code"}</Text>
          </View>
          <ChevronRight size={18} color="#6b1f1f" />
        </View>
      </Link>
    </AppScreen>
  );
}

function Info({ icon: Icon, label }: { icon: typeof CalendarDays; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon size={16} color="#6b1f1f" />
      <AppText className="text-sm" muted>{label}</AppText>
    </View>
  );
}

function Overview({ icon: Icon, label, value, sub, gold = false }: { icon: typeof Bell; label: string; value: string; sub: string; gold?: boolean }) {
  return (
    <Card className="flex-1 rounded-2xl">
      <View className={`h-9 w-9 items-center justify-center rounded-xl ${gold ? "bg-gold-soft" : "bg-success-soft"}`}>
        <Icon size={20} color={gold ? "#4d3712" : "#2f9d68"} />
      </View>
      <AppText className="mt-3 text-[11px]" muted>{label}</AppText>
      <AppText className="text-base font-extrabold">{value}</AppText>
      <AppText className="text-[11px]" muted>{sub}</AppText>
    </Card>
  );
}
