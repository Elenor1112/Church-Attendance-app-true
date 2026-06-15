import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { ArrowRight, Lock, Phone, ShieldCheck, User, UserCog } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { AppScreen, AppText, Button, LanguageToggle, LogoMark, TextField } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { loginSchema } from "@/lib/validation";
import type { LoginInput, Role } from "@/types";

export default function SignInScreen() {
  const { t, lang } = useLang();
  const { signIn, demoSignIn } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "+20 100 123 4567", password: "demo" },
  });

  const onSubmit = handleSubmit((values) => signIn(values));

  return (
    <AppScreen contentClassName="min-h-full justify-between pt-4">
      <View className="items-end">
        <LanguageToggle />
      </View>

      <View className="items-center pt-4">
        <LogoMark size={86} />
        <AppText className="mt-4 text-center text-2xl font-extrabold text-primary">{t("churchName")}</AppText>
        <Text className="mt-1 text-center text-sm text-muted-foreground">Virgin Mary & St. Bishoy Church</Text>
      </View>

      <View className="mt-8 rounded-t-[32px] bg-card p-5 shadow-card">
        <AppText className="text-xl font-extrabold">{t("welcomeBack")}</AppText>
        <AppText className="mt-1 text-sm" muted>
          {lang === "ar" ? "سجل دخولك للمتابعة إلى حسابك" : "Sign in to continue to your account"}
        </AppText>

        <View className="mt-5 gap-4">
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label={t("phone")}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                keyboardType="phone-pad"
                textAlign="left"
                error={errors.phone?.message}
                left={<Phone size={17} color="#766a5f" />}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label={t("password")}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                secureTextEntry
                error={errors.password?.message}
                left={<Lock size={17} color="#766a5f" />}
              />
            )}
          />

          <Button onPress={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="#fffaf1" /> : null}
            <Text className="text-base font-extrabold text-primary-foreground">{t("signIn")}</Text>
            <ArrowRight size={17} color="#fffaf1" />
          </Button>
        </View>

        <Link href="/register" asChild>
          <Pressable className="mt-4 min-h-12 items-center justify-center rounded-2xl border border-border bg-primary-soft">
            <Text className="text-sm font-extrabold text-primary">{t("newMember")}</Text>
          </Pressable>
        </Link>

        <View className="my-5 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-border" />
          <Text className="text-[11px] font-bold uppercase text-muted-foreground">{t("enterRole")}</Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <View className="flex-row gap-2">
          <RoleChip role="member" label={t("member")} icon={User} onPress={() => demoSignIn("member")} />
          <RoleChip role="admin" label={t("admin")} icon={UserCog} onPress={() => demoSignIn("admin")} />
          <RoleChip role="super-admin" label={t("superAdmin")} icon={ShieldCheck} onPress={() => demoSignIn("super-admin")} />
        </View>
      </View>
    </AppScreen>
  );
}

function RoleChip({
  label,
  icon: Icon,
  onPress,
}: {
  role: Role;
  label: string;
  icon: typeof User;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      className="flex-1 items-center gap-1.5 rounded-2xl border border-border bg-card px-2 py-3"
    >
      <Icon size={22} color="#6b1f1f" />
      <Text numberOfLines={1} adjustsFontSizeToFit className="text-center text-[11px] font-extrabold text-foreground">
        {label}
      </Text>
    </Pressable>
  );
}
