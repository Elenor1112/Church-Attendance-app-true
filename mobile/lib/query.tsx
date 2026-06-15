import NetInfo from "@react-native-community/netinfo";
import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

export const queryKeys = {
  memberHome: ["memberHome"] as const,
  notifications: ["notifications"] as const,
  attendanceLogs: (filter: string, search: string) => ["attendanceLogs", filter, search] as const,
  adminComms: ["adminComms"] as const,
  pendingMembers: ["pendingMembers"] as const,
  members: (role: string, status: string, search: string) => ["members", role, status, search] as const,
  dashboard: ["dashboard"] as const,
};

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      onlineManager.setOnline(Boolean(state.isConnected));
    });
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
