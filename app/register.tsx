import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { registerSchema } from "@/lib/validation";
import { AppScreen, AppText, Button, IconButton, LanguageToggle, LogoMark, TextField } from "@/components/ui";
import type { RegisterInput } from "@/types";

export default function RegisterScreen() {
  const { t, lang } = useLang();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", phone: "", birthday: "", spousePhone: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    await api.register(values);
    router.replace("/");
  });

  return (
    <AppScreen contentClassName="pt-2">
      <View className="flex-row items-center justify-between">
        <IconButton icon={ArrowLeft} label="Back" onPress={() => router.back()} />
        <LanguageToggle subtle />
      </View>

      <View className="mt-4 items-center">
        <LogoMark size={66} />
        <AppText className="mt-3 text-center text-xl font-extrabold">{t("churchName")}</AppText>
        <AppText className="mt-1 text-xs" muted>{t("registration")}</AppText>
      </View>

      <View className="mt-6 rounded-3xl bg-card p-5 shadow-card">
        <AppText className="mb-4 text-sm font-extrabold">
          {lang === "ar" ? "املأ بياناتك للانضمام" : "Fill in your details to join"}
        </AppText>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <ControlledField control={control} name="firstName" label={t("firstName")} error={errors.firstName?.message} />
          </View>
          <View className="flex-1">
            <ControlledField control={control} name="lastName" label={t("lastName")} error={errors.lastName?.message} />
          </View>
        </View>
        <View className="mt-4 gap-4">
          <ControlledField control={control} name="phone" label={t("phone")} error={errors.phone?.message} keyboardType="phone-pad" textAlign="left" />
          <ControlledField control={control} name="birthday" label={t("birthday")} error={errors.birthday?.message} placeholder="YYYY-MM-DD" textAlign="left" />
          <ControlledField control={control} name="spousePhone" label={t("spousePhone")} error={errors.spousePhone?.message} keyboardType="phone-pad" textAlign="left" />
          <ControlledField control={control} name="email" label={t("email")} error={errors.email?.message} keyboardType="email-address" textAlign="left" autoCapitalize="none" />
          <ControlledField control={control} name="password" label={t("password")} error={errors.password?.message} secureTextEntry />
        </View>
      </View>

      <Button className="mt-5" onPress={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color="#fffaf1" /> : null}
        <Text className="text-base font-extrabold text-primary-foreground">{t("register")}</Text>
      </Button>

      <Pressable onPress={() => router.replace("/")} className="mt-4 h-11 items-center justify-center">
        <Text className="text-sm font-semibold text-muted-foreground">{t("backToSignIn")}</Text>
      </Pressable>
    </AppScreen>
  );
}

function ControlledField({
  control,
  name,
  label,
  error,
  ...props
}: {
  control: ReturnType<typeof useForm<RegisterInput>>["control"];
  name: keyof RegisterInput;
  label: string;
  error?: string;
} & React.ComponentProps<typeof TextField>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextField label={label} value={String(value ?? "")} onBlur={onBlur} onChangeText={onChange} error={error} {...props} />
      )}
    />
  );
}
