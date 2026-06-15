import { LinearGradient } from "expo-linear-gradient";
import { Languages, RefreshCcw } from "lucide-react-native";
import type { ComponentType, ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  type RefreshControlProps,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLang } from "@/lib/i18n";

type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export function AppScreen({
  children,
  scroll = true,
  className = "",
  contentClassName = "",
  refreshControl,
}: {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}) {
  const body = <View className={`px-5 pb-8 ${contentClassName}`}>{children}</View>;
  return (
    <SafeAreaView className={`flex-1 bg-background ${className}`}>
      {scroll ? <ScrollView refreshControl={refreshControl} showsVerticalScrollIndicator={false}>{body}</ScrollView> : body}
    </SafeAreaView>
  );
}

export function AppText({
  children,
  className = "",
  muted = false,
  rtl,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
  rtl?: boolean;
}) {
  const { isRtl } = useLang();
  return (
    <Text
      className={`${muted ? "text-muted-foreground" : "text-foreground"} ${className}`}
      style={{ textAlign: rtl ?? isRtl ? "right" : "left", writingDirection: rtl ?? isRtl ? "rtl" : "ltr" }}
    >
      {children}
    </Text>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <View className={`rounded-3xl bg-card p-4 shadow-card ${className}`}>{children}</View>;
}

export function GradientCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <LinearGradient colors={["#7b2726", "#4f1718"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className={`rounded-3xl p-5 shadow-card ${className}`}>
      {children}
    </LinearGradient>
  );
}

export function GoldBubble({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <View className={`items-center justify-center rounded-2xl bg-gold-soft ${className}`}>{children}</View>;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "success";
  disabled?: boolean;
  className?: string;
}) {
  const variants = {
    primary: "bg-primary",
    secondary: "bg-primary-soft",
    outline: "border border-border bg-card",
    danger: "bg-destructive-soft",
    success: "bg-success",
  };
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }]}
      className={`min-h-12 flex-row items-center justify-center gap-2 rounded-2xl px-4 py-3 ${variants[variant]} ${className}`}
    >
      {typeof children === "string" ? (
        <Text
          className={`text-sm font-bold ${
            variant === "primary" || variant === "success" ? "text-primary-foreground" : variant === "danger" ? "text-destructive" : "text-foreground"
          }`}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function IconButton({ icon: Icon, onPress, label, tone = "light" }: { icon: IconType; onPress?: () => void; label: string; tone?: "light" | "primary" }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
      className={`h-10 w-10 items-center justify-center rounded-full ${tone === "primary" ? "bg-primary" : "bg-card"}`}
    >
      <Icon size={18} color={tone === "primary" ? "#fffaf1" : "#6b1f1f"} />
    </Pressable>
  );
}

export function TextField({
  label,
  error,
  left,
  inputClassName = "",
  ...props
}: TextInputProps & {
  label?: string;
  error?: string;
  left?: ReactNode;
  inputClassName?: string;
}) {
  const { isRtl } = useLang();
  return (
    <View className="gap-1.5">
      {label ? <AppText className="text-xs font-bold text-muted-foreground">{label}</AppText> : null}
      <View className="min-h-12 flex-row items-center gap-2 rounded-2xl border border-border bg-card px-3">
        {left}
        <TextInput
          placeholderTextColor="#8a7b70"
          className={`flex-1 py-3 text-base text-foreground ${inputClassName}`}
          style={{ textAlign: props.textAlign ?? (isRtl ? "right" : "left"), writingDirection: isRtl ? "rtl" : "ltr" }}
          {...props}
        />
      </View>
      {error ? <Text className="px-1 text-xs font-semibold text-destructive">{error}</Text> : null}
    </View>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View className="mb-5 mt-2 flex-row items-center justify-between gap-3">
      <View className="min-w-0 flex-1">
        <AppText className="text-2xl font-extrabold">{title}</AppText>
        {subtitle ? <AppText className="mt-0.5 text-xs" muted>{subtitle}</AppText> : null}
      </View>
      {right}
    </View>
  );
}

export function LanguageToggle({ subtle = false }: { subtle?: boolean }) {
  const { lang, toggle } = useLang();
  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      className={`h-10 flex-row items-center gap-1.5 rounded-full px-3 ${subtle ? "border border-border bg-card" : "bg-card/80"}`}
    >
      <Languages size={15} color="#6b1f1f" />
      <Text className="text-xs font-bold text-foreground">{lang === "ar" ? "EN" : "ع"}</Text>
    </Pressable>
  );
}

export function Avatar({ initials, uri, size = 44, gold = false }: { initials: string; uri?: string; size?: number; gold?: boolean }) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={style} className="bg-muted" />;
  return (
    <View style={style} className={`items-center justify-center ${gold ? "bg-gold" : "bg-primary"}`}>
      <Text style={{ fontSize: size * 0.38 }} className={`font-extrabold ${gold ? "text-gold-foreground" : "text-primary-foreground"}`}>
        {initials}
      </Text>
    </View>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "destructive" | "gold" | "neutral";
}) {
  const classes = {
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    destructive: "bg-destructive-soft text-destructive",
    gold: "bg-gold-soft text-gold-foreground",
    neutral: "bg-muted text-muted-foreground",
  };
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${classes[tone].split(" ")[0]}`}>
      <Text className={`text-[11px] font-extrabold ${classes[tone].split(" ")[1]}`}>{children}</Text>
    </View>
  );
}

export function EmptyState({ icon: Icon, title, body }: { icon: IconType; title: string; body: string }) {
  return (
    <View className="mt-16 items-center px-8">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon size={28} color="#766a5f" />
      </View>
      <AppText className="mt-4 text-center text-base font-bold">{title}</AppText>
      <AppText className="mt-1 text-center text-sm" muted>
        {body}
      </AppText>
    </View>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 py-16">
      <ActivityIndicator color="#6b1f1f" />
      <AppText className="text-sm font-semibold" muted>{label}</AppText>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useLang();
  return (
    <View className="items-center gap-3 rounded-3xl border border-border bg-card p-5">
      <AppText className="text-center text-sm font-bold">{message}</AppText>
      {onRetry ? (
        <Button variant="secondary" onPress={onRetry}>
          <RefreshCcw size={16} color="#6b1f1f" />
          <Text className="text-sm font-bold text-primary">{t("retry")}</Text>
        </Button>
      ) : null}
    </View>
  );
}

export function OfflineBanner() {
  const { t } = useLang();
  return (
    <View className="mb-3 rounded-2xl bg-warning-soft px-4 py-2">
      <Text className="text-center text-xs font-bold text-warning">{t("offline")}</Text>
    </View>
  );
}

export function LogoMark({ size = 72 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28 }} className="items-center justify-center bg-card shadow-card">
      <View style={{ width: size * 0.72, height: size * 0.72, borderRadius: size * 0.36 }} className="items-center justify-center border-2 border-gold bg-primary">
        <Text style={{ fontSize: size * 0.34 }} className="font-extrabold text-primary-foreground">
          ✝
        </Text>
      </View>
    </View>
  );
}
