import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { ArrowRight, Lock, Phone } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { AppScreen, AppText, Button, LanguageToggle, LogoMark, TextField } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { loginSchema } from "@/lib/validation";
import type { LoginInput } from "@/types";

export default function SignInScreen() {
  const { t, lang } = useLang();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await signIn(values);
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    }
  });

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

          {error ? (
            <Text className="text-center text-sm font-semibold text-destructive">{error}</Text>
          ) : null}

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
      </View>
    </AppScreen>
  );
}
