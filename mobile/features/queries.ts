import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { ManualMemberInput, MemberStatus, Role, SendAlertInput, User } from "@/types";

export function useMemberHomeQuery() {
  return useQuery({ queryKey: queryKeys.memberHome, queryFn: api.memberHome });
}

export function useNotificationsQuery() {
  return useQuery({ queryKey: queryKeys.notifications, queryFn: api.notifications });
}

export function useClearNotificationsMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.clearNotifications,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useAttendanceLogsQuery(filter: "today" | "thisWeek" | "all", search: string) {
  return useQuery({ queryKey: queryKeys.attendanceLogs(filter, search), queryFn: () => api.attendanceLogs(filter, search) });
}

export function useAdminCommsQuery() {
  return useQuery({ queryKey: queryKeys.adminComms, queryFn: api.adminComms });
}

export function useSendAlertMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: SendAlertInput) => api.sendAlert(input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.adminComms });
      client.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function usePendingMembersQuery() {
  return useQuery({ queryKey: queryKeys.pendingMembers, queryFn: api.pendingMembers });
}

export function useUpdateMemberStatusMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MemberStatus }) => api.updateMemberStatus(id, status),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.pendingMembers });
      client.invalidateQueries({ queryKey: ["members"] });
      client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useCreateMemberMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ManualMemberInput) => api.createMember(input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.pendingMembers });
      client.invalidateQueries({ queryKey: ["members"] });
      client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useMembersQuery(role: Role | "all", status: MemberStatus | "all", search: string) {
  return useQuery({ queryKey: queryKeys.members(role, status, search), queryFn: () => api.members(role, status, search) });
}

export function useDashboardQuery() {
  return useQuery({ queryKey: queryKeys.dashboard, queryFn: api.dashboard });
}

export function useRecordAttendanceMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, user }: { payload: string; user: User }) => api.recordAttendance(payload, user),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["attendanceLogs"] });
      client.invalidateQueries({ queryKey: queryKeys.dashboard });
      client.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useProfilePhotoMutation() {
  return useMutation({ mutationFn: ({ user, photoUri }: { user: User; photoUri: string }) => api.updateProfilePhoto(user, photoUri) });
}
