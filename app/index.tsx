// app/index.tsx
import { useEffect } from "react";
import { View, ActivityIndicator, Platform, Text } from "react-native";
import { router } from "expo-router";
import { useBaguioQuest } from "../hooks/use-baguio-quest";

export default function IndexScreen() {
  const { hasSeenSplash, hasAcceptedTerms } = useBaguioQuest();

  useEffect(() => {
    // Avoid navigation loops on web while building PWA
    const t = setTimeout(() => {
      if (Platform.OS === "web") {
        // Simplified route for web build (temporary)
        router.replace("/splash");
        return;
      }

      if (!hasSeenSplash) router.replace("/splash");
      else if (!hasAcceptedTerms) router.replace("/terms");
      else router.replace("/(tabs)/map");
    }, 50);

    return () => clearTimeout(t);
  }, [hasSeenSplash, hasAcceptedTerms]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <ActivityIndicator />
      {Platform.OS === "web" && (
        <Text style={{ marginTop: 10, color: "#444" }}>
          Loading BaguioQuest Web…
        </Text>
      )}
    </View>
  );
}
