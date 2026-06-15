import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { Clock3, ScanLine, Users } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { AppScreen, AppText, Avatar, Button, Card, LanguageToggle, StatusPill } from "@/components/ui";
import { useRecordAttendanceMutation } from "@/features/queries";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

export default function ScannerScreen() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [enabled, setEnabled] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const record = useRecordAttendanceMutation();

  const handleScan = async (result: BarcodeScanningResult) => {
    if (!enabled || !user || result.data === lastScan || record.isPending) return;
    setLastScan(result.data);
    try {
      await record.mutateAsync({ payload: result.data, user });
      Alert.alert(t("scanner"), t("qrRecorded"));
      setEnabled(false);
    } catch {
      Alert.alert(t("scanner"), t("invalidQr"));
    } finally {
      setTimeout(() => setLastScan(null), 1500);
    }
  };

  return (
    <AppScreen contentClassName="pt-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Avatar initials={user?.initials ?? "GS"} uri={user?.photoUri} gold />
          <View>
            <AppText className="text-[11px]" muted>{lang === "ar" ? "مرحبا" : "Hello"}</AppText>
            <AppText className="text-sm font-extrabold">{user?.name[lang]}</AppText>
          </View>
        </View>
        <View className="items-end gap-2">
          <StatusPill tone="gold">{t("admin")}</StatusPill>
          <LanguageToggle subtle />
        </View>
      </View>

      <Card className="mt-6 p-5">
        <AppText className="text-[11px] font-extrabold uppercase" muted>{t("scanner")}</AppText>
        <AppText className="mt-1 text-lg font-extrabold">{t("scanQr")}</AppText>

        <View className="mt-5 aspect-square overflow-hidden rounded-3xl bg-[#1d1716]">
          {permission?.granted && enabled ? (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handleScan}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <ScanLine size={58} color="#d7aa3d" />
              <AppText className="mt-3 text-center text-sm text-primary-foreground">{permission?.granted ? t("scanQr") : t("cameraPermission")}</AppText>
            </View>
          )}
          <View className="absolute left-4 top-4 h-7 w-7 rounded-tl-lg border-l-2 border-t-2 border-gold" />
          <View className="absolute right-4 top-4 h-7 w-7 rounded-tr-lg border-r-2 border-t-2 border-gold" />
          <View className="absolute bottom-4 left-4 h-7 w-7 rounded-bl-lg border-b-2 border-l-2 border-gold" />
          <View className="absolute bottom-4 right-4 h-7 w-7 rounded-br-lg border-b-2 border-r-2 border-gold" />
        </View>

        {!permission?.granted ? (
          <Button className="mt-5" onPress={requestPermission}>{t("allowCamera")}</Button>
        ) : (
          <Button className="mt-5" onPress={() => setEnabled((value) => !value)}>
            <ScanLine size={17} color="#fffaf1" />
            <Text className="text-sm font-extrabold text-primary-foreground">{enabled ? t("manualEntry") : t("scanQr")}</Text>
          </Button>
        )}
      </Card>

      <View className="mt-5 flex-row gap-3">
        <Summary icon={Users} value="42" label={t("todayCheckIns")} />
        <Summary icon={Clock3} value="5" label={t("pendingApprovals")} gold />
      </View>
    </AppScreen>
  );
}

function Summary({ icon: Icon, value, label, gold = false }: { icon: typeof Users; value: string; label: string; gold?: boolean }) {
  return (
    <Card className="flex-1 rounded-2xl">
      <View className={`h-9 w-9 items-center justify-center rounded-xl ${gold ? "bg-gold-soft" : "bg-primary-soft"}`}>
        <Icon size={20} color={gold ? "#4d3712" : "#6b1f1f"} />
      </View>
      <AppText className="mt-3 text-2xl font-extrabold">{value}</AppText>
      <AppText className="text-[11px]" muted>{label}</AppText>
    </Card>
  );
}
