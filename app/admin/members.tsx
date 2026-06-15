import { zodResolver } from "@hookform/resolvers/zod";
import { Check, UserPlus, X } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal, Pressable, RefreshControl, Text, View } from "react-native";
import {
  AppScreen,
  AppText,
  Avatar,
  Button,
  Card,
  ErrorState,
  LoadingState,
  PageHeader,
  TextField,
} from "@/components/ui";
import { useCreateMemberMutation, usePendingMembersQuery, useUpdateMemberStatusMutation } from "@/features/queries";
import { useLang } from "@/lib/i18n";
import { manualMemberSchema } from "@/lib/validation";
import type { ManualMemberInput } from "@/types";

export default function AdminMembersScreen() {
  const { t, lang } = useLang();
  const query = usePendingMembersQuery();
  const update = useUpdateMemberStatusMutation();
  const [modalOpen, setModalOpen] = useState(false);

  if (query.isLoading) return <LoadingState label={t("loading")} />;
  if (query.isError) return <AppScreen><ErrorState message={String(query.error.message)} onRetry={() => query.refetch()} /></AppScreen>;

  return (
    <AppScreen contentClassName="pt-4" refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={query.refetch} />}>
      <PageHeader title={t("members")} subtitle={`${query.data?.length ?? 0} ${t("pendingRequests")}`} />
      <Button variant="secondary" onPress={() => setModalOpen(true)}>
        <UserPlus size={17} color="#6b1f1f" />
        <Text className="text-sm font-extrabold text-primary">{t("addMember")}</Text>
      </Button>

      <AppText className="mt-6 px-1 text-[11px] font-extrabold uppercase" muted>{t("pendingRequests")}</AppText>
      <View className="mt-2 gap-3">
        {query.data?.length ? (
          query.data.map((member) => (
            <Card key={member.id} className="rounded-2xl">
              <View className="flex-row items-center gap-3">
                <Avatar initials={member.initials} gold />
                <View className="min-w-0 flex-1">
                  <AppText className="text-sm font-extrabold">{member.name[lang]}</AppText>
                  <Text className="text-[11px] text-muted-foreground">{member.phone}</Text>
                  <AppText className="mt-0.5 text-[11px]" muted>{t("registeredOn")}: {member.registered}</AppText>
                </View>
              </View>
              <View className="mt-3 flex-row gap-2">
                <Button className="flex-1" variant="success" disabled={update.isPending} onPress={() => update.mutate({ id: member.id, status: "approved" })}>
                  <Check size={16} color="#fffaf1" />
                  <Text className="text-xs font-extrabold text-primary-foreground">{t("approve")}</Text>
                </Button>
                <Button className="flex-1" variant="outline" disabled={update.isPending} onPress={() => update.mutate({ id: member.id, status: "rejected" })}>
                  <X size={16} color="#c03232" />
                  <Text className="text-xs font-extrabold text-destructive">{t("reject")}</Text>
                </Button>
              </View>
            </Card>
          ))
        ) : (
          <Card className="items-center rounded-2xl border border-dashed border-border">
            <AppText className="text-sm" muted>{lang === "ar" ? "لا توجد طلبات معلقة" : "No pending requests"}</AppText>
          </Card>
        )}
      </View>

      <CreateMemberModal visible={modalOpen} onClose={() => setModalOpen(false)} />
    </AppScreen>
  );
}

function CreateMemberModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useLang();
  const create = useCreateMemberMutation();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ManualMemberInput>({
    resolver: zodResolver(manualMemberSchema),
    defaultValues: { firstName: "", lastName: "", phone: "", birthday: "", spousePhone: "", email: "", password: "church123", role: "member" },
  });
  const role = watch("role");

  const submit = handleSubmit(async (values) => {
    await create.mutateAsync(values);
    onClose();
  });

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/35">
        <View className="max-h-[88%] rounded-t-[28px] bg-background p-5">
          <View className="flex-row items-center justify-between">
            <AppText className="text-xl font-extrabold">{t("addMember")}</AppText>
            <Pressable onPress={onClose} className="h-9 w-9 items-center justify-center rounded-full bg-muted">
              <Text className="text-lg font-bold text-foreground">×</Text>
            </Pressable>
          </View>
          <View className="mt-4 flex-row gap-2">
            {(["member", "admin", "super-admin"] as const).map((item) => (
              <Text
                key={item}
                onPress={() => setValue("role", item)}
                className={`overflow-hidden rounded-full px-3 py-2 text-xs font-extrabold ${role === item ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
              >
                {item === "super-admin" ? t("superAdmin") : item === "admin" ? t("admin") : t("member")}
              </Text>
            ))}
          </View>
          <View className="mt-4 gap-3">
            {(["firstName", "lastName", "phone", "birthday", "spousePhone", "email", "password"] as const).map((name) => (
              <Controller
                key={name}
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    label={
                      name === "firstName"
                        ? t("firstName")
                        : name === "lastName"
                          ? t("lastName")
                          : name === "phone"
                            ? t("phone")
                            : name === "birthday"
                              ? t("birthday")
                              : name === "spousePhone"
                                ? t("spousePhone")
                                : name === "email"
                                  ? t("email")
                                  : t("password")
                    }
                    value={String(value ?? "")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors[name]?.message}
                    secureTextEntry={name === "password"}
                    keyboardType={name.includes("phone") ? "phone-pad" : name === "email" ? "email-address" : "default"}
                    textAlign={name === "phone" || name === "email" || name === "birthday" ? "left" : undefined}
                  />
                )}
              />
            ))}
          </View>
          <Button className="mt-5" onPress={submit} disabled={create.isPending}>
            <Text className="text-sm font-extrabold text-primary-foreground">{t("addMember")}</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}
