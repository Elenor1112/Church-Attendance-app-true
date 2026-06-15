import * as ImagePicker from "expo-image-picker";
import { Cake, Camera, ChevronRight, LogOut, Mail, Pencil, Phone } from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";
import { AppScreen, AppText, Avatar, Button, Card, PageHeader, StatusPill } from "@/components/ui";
import { useProfilePhotoMutation } from "@/features/queries";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

export default function MemberProfileScreen() {
  const { t, lang } = useLang();
  const { user, signOut, updateUser } = useAuth();
  const photoMutation = useProfilePhotoMutation();

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (result.canceled || !user) return;
    const next = await photoMutation.mutateAsync({ user, photoUri: result.assets[0]?.uri ?? "" });
    await updateUser(next);
    Alert.alert(t("profile"), t("imageUpdated"));
  };

  return (
    <AppScreen contentClassName="pt-4">
      <PageHeader title={t("profile")} />

      <Card className="items-center p-6">
        <View>
          <Avatar initials={user?.initials ?? "MA"} uri={user?.photoUri} size={96} />
          <Pressable onPress={choosePhoto} className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full border-4 border-card bg-gold">
            <Camera size={16} color="#4d3712" />
          </Pressable>
        </View>
        <AppText className="mt-4 text-center text-lg font-extrabold">{user?.name[lang]}</AppText>
        <Text className="text-xs text-muted-foreground">{user?.phone}</Text>
        <View className="mt-3">
          <StatusPill tone="success">{t("approved")}</StatusPill>
        </View>
      </Card>

      <AppText className="mt-6 px-1 text-[11px] font-extrabold uppercase" muted>{t("personalInfo")}</AppText>
      <Card className="mt-2 gap-1 rounded-2xl p-0">
        <Info icon={Phone} label={t("phone")} value={user?.phone ?? ""} />
        <Info icon={Cake} label={t("birthday")} value={user?.birthday ?? "-"} />
        <Info icon={Mail} label={t("email")} value={user?.email ?? "-"} />
      </Card>

      <View className="mt-5 gap-2">
        <Action icon={Phone} label={t("changePhone")} />
        <Action icon={Pencil} label={t("editProfile")} />
      </View>

      <Button variant="danger" className="mt-6" onPress={signOut}>
        <LogOut size={17} color="#c03232" />
        <Text className="text-sm font-extrabold text-destructive">{t("signOut")}</Text>
      </Button>
    </AppScreen>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
        <Icon size={17} color="#6b1f1f" />
      </View>
      <View className="min-w-0 flex-1">
        <AppText className="text-[11px]" muted>{label}</AppText>
        <Text numberOfLines={1} className="text-sm font-extrabold text-foreground">{value}</Text>
      </View>
    </View>
  );
}

function Action({ icon: Icon, label }: { icon: typeof Phone; label: string }) {
  return (
    <Pressable className="flex-row items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
        <Icon size={17} color="#6b1f1f" />
      </View>
      <AppText className="flex-1 text-sm font-extrabold">{label}</AppText>
      <ChevronRight size={17} color="#766a5f" />
    </Pressable>
  );
}
