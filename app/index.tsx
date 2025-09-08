// app/index.tsx
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useBaguioQuest } from "../hooks/use-baguio-quest";

export default function IndexScreen() {
  const { hasSeenSplash, hasAcceptedTerms } = useBaguioQuest();

  useEffect(() => {
    const t = setTimeout(() => {
      if (!hasSeenSplash) router.replace("/splash");
      else if (!hasAcceptedTerms) router.replace("/terms");
      else router.replace("/(tabs)/map");
    }, 50);
    return () => clearTimeout(t);
  }, [hasSeenSplash, hasAcceptedTerms]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
