// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
// import { GestureHandlerRootView } from "react-native-gesture-handler"; // optional while debugging
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BaguioQuestProvider } from "../hooks/use-baguio-quest";

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" />
      {/* Re-add when files exist and errors are gone:
        <Stack.Screen name="splash" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="(tabs)" />
      */}
    </Stack>
  );
}
