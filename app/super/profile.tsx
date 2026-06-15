import * as ImagePicker from "expo-image-picker";
import { Camera, LogOut, ShieldCheck } from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";
import { AppScreen, AppText, Avatar, Button, Card, PageHeader, StatusPill } from "@/components/ui";
import { useProfilePhotoMutation } from "@/features/queries";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

export default function SuperProfileScreen() {
  const { t, lang } = useLang();
  const { user, signOut, updateUser } = useAuth();
  const photoMutation = useProfilePhotoMutation();

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted || !user) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (result.canceled) return;
    const next = await photoMutation.mutateAsync({ user, photoUri: result.assets[0]?.uri ?? "" });
    await updateUser(next);
    Alert.alert(t("profile"), t("imageUpdated"));
  };

  return (
    <AppScreen contentClassName="pt-4">
      <PageHeader title={t("profile")} />
      <Card className="items-center p-6">
        <View>
          <Avatar initials={user?.initials ?? "MH"} uri={user?.photoUri} size={96} />
          <Pressable onPress={choosePhoto} className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full border-4 border-card bg-gold">
            <Camera size={16} color="#4d3712" />
          </Pressable>
        </View>
        <AppText className="mt-4 text-center text-lg font-extrabold">{user?.name[lang]}</AppText>
        <Text className="text-xs text-muted-foreground">{user?.phone}</Text>
        <View className="mt-3">
          <StatusPill tone="gold">
            <ShieldCheck size={12} color="#4d3712" /> {t("superAdmin")}
          </StatusPill>
        </View>
      </Card>

      <Button variant="danger" className="mt-5" onPress={signOut}>
        <LogOut size={17} color="#c03232" />
        <Text className="text-sm font-extrabold text-destructive">{t("signOut")}</Text>
      </Button>
    </AppScreen>
  );
}
