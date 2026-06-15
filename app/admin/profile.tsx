import * as ImagePicker from "expo-image-picker";
import { Camera, LogOut, Pencil } from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";
import { AppScreen, AppText, Avatar, Button, Card, PageHeader, StatusPill } from "@/components/ui";
import { useProfilePhotoMutation } from "@/features/queries";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

export default function AdminProfileScreen() {
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
          <Avatar initials={user?.initials ?? "GS"} uri={user?.photoUri} size={96} gold />
          <Pressable onPress={choosePhoto} className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full border-4 border-card bg-primary">
            <Camera size={16} color="#fffaf1" />
          </Pressable>
        </View>
        <AppText className="mt-4 text-center text-lg font-extrabold">{user?.name[lang]}</AppText>
        <Text className="text-xs text-muted-foreground">{user?.phone}</Text>
        <View className="mt-3">
          <StatusPill tone="gold">{t("admin")}</StatusPill>
        </View>
      </Card>

      <Pressable className="mt-5 flex-row items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
          <Pencil size={17} color="#6b1f1f" />
        </View>
        <AppText className="text-sm font-extrabold">{t("editProfile")}</AppText>
      </Pressable>

      <Button variant="danger" className="mt-4" onPress={signOut}>
        <LogOut size={17} color="#c03232" />
        <Text className="text-sm font-extrabold text-destructive">{t("signOut")}</Text>
      </Button>
    </AppScreen>
  );
}
