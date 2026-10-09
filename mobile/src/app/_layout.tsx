import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { loading, user } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => {});
  }, [loading]);

  if (loading) return null;

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.ink,
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="event/[slug]" options={{ title: "" }} />
        <Stack.Screen name="event/register" options={{ presentation: "modal", title: "Register" }} />
        <Stack.Screen name="club/[slug]" options={{ title: "" }} />
        <Stack.Screen name="club/join" options={{ presentation: "modal", title: "Join club" }} />
        <Stack.Screen name="club/request" options={{ presentation: "modal", title: "Request admin access" }} />
        <Stack.Screen name="my-events" options={{ title: "My events" }} />
        <Stack.Screen name="club-dashboard" options={{ title: "Club dashboard" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
