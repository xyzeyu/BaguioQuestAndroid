// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Use RELATIVE import to avoid alias issues while debugging
import { BaguioQuestProvider } from "../hooks/use-baguio-quest";

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    // Don’t block the UI; if there’s an error we’ll see it
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <BaguioQuestProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="splash" />
            <Stack.Screen name="terms" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </BaguioQuestProvider>
  );
}
