import NetInfo from "@react-native-community/netinfo";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export function useOnlineStatus() {
  const [isOnline, setOnline] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected)));
  }, []);

  return isOnline;
}

export function usePushRegistration(enabled: boolean) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    async function register() {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      const current = await Notifications.getPermissionsAsync();
      const finalStatus = current.status === "granted" ? current.status : (await Notifications.requestPermissionsAsync()).status;
      if (finalStatus !== "granted") return;
      const token = await Notifications.getExpoPushTokenAsync().catch(() => null);
      if (mounted && token?.data) setExpoPushToken(token.data);
    }
    register();
    return () => {
      mounted = false;
    };
  }, [enabled]);

  return expoPushToken;
}
