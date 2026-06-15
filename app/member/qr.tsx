import * as Sharing from "expo-sharing";
import { Download, Share2 } from "lucide-react-native";
import { useMemo, useRef } from "react";
import { Alert, Share, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { AppScreen, AppText, Button, Card, LanguageToggle, PageHeader, StatusPill } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

export default function MyQrScreen() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const qrRef = useRef<any>(null);
  const payload = useMemo(
    () =>
      JSON.stringify({
        type: "church-attendance",
        memberId: user?.id ?? "member-1",
        phone: user?.phone ?? "",
        issuedAt: Date.now(),
      }),
    [user?.id, user?.phone],
  );

  const sharePayload = async () => {
    await Share.share({ message: payload, title: "Church Attendance QR" });
  };

  const saveQr = async () => {
    qrRef.current?.toDataURL?.(async (data: string) => {
      try {
        const uri = `data:image/png;base64,${data}`;
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          await Share.share({ message: payload });
        }
      } catch {
        Alert.alert(t("myQr"), lang === "ar" ? "تعذر حفظ الرمز الآن" : "Could not save the QR code right now");
      }
    });
  };

  return (
    <AppScreen contentClassName="pt-4">
      <PageHeader title={t("myQr")} subtitle={lang === "ar" ? "للحضور السريع" : "Quick check-in"} right={<LanguageToggle subtle />} />

      <Card className="items-center p-6">
        <StatusPill tone="gold">{t("active")}</StatusPill>
        <View className="mt-5 rounded-3xl border border-border bg-background p-5">
          <QRCode
            getRef={(ref) => {
              qrRef.current = ref;
            }}
            value={payload}
            size={220}
            color="#2c211f"
            backgroundColor="transparent"
          />
        </View>
        <AppText className="mt-5 text-center text-lg font-extrabold">{user?.name[lang]}</AppText>
        <Text className="text-xs text-muted-foreground">{user?.phone}</Text>
      </Card>

      <AppText className="mt-4 text-center text-xs" muted>{t("showQr")}</AppText>

      <View className="mt-5 flex-row gap-3">
        <Button variant="outline" className="flex-1" onPress={saveQr}>
          <Download size={17} color="#2c211f" />
          <Text className="text-sm font-extrabold text-foreground">{t("save")}</Text>
        </Button>
        <Button variant="outline" className="flex-1" onPress={sharePayload}>
          <Share2 size={17} color="#2c211f" />
          <Text className="text-sm font-extrabold text-foreground">{t("share")}</Text>
        </Button>
      </View>
    </AppScreen>
  );
}
