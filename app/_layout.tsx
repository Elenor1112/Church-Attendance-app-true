import "@/../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/lib/auth";
import { usePushRegistration } from "@/lib/hooks";
import { LanguageProvider } from "@/lib/i18n";
import { QueryProvider } from "@/lib/query";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function AppServices({ children }: { children: React.ReactNode }) {
  usePushRegistration(true);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return children;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppServices>
                <StatusBar style="dark" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="register" />
                  <Stack.Screen name="member" />
                  <Stack.Screen name="admin" />
                  <Stack.Screen name="super" />
                </Stack>
              </AppServices>
            </AuthProvider>
          </LanguageProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
