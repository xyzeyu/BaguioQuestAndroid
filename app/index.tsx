// app/index.tsx
import { useEffect } from "react";
import { View, ActivityIndicator, Platform, Text, Pressable } from "react-native";
import { router, Link } from "expo-router";
import { useBaguioQuest } from "../hooks/use-baguio-quest";

export default function IndexScreen() {
  const { hasSeenSplash, hasAcceptedTerms } = useBaguioQuest();

  useEffect(() => {
    // Keep auto-nav for native only to avoid blank pages / 404 loops on web
    if (Platform.OS !== "web") {
      const t = setTimeout(() => {
        if (!hasSeenSplash) router.replace("/splash");
        else if (!hasAcceptedTerms) router.replace("/terms");
        else router.replace("/(tabs)/map");
      }, 50);
      return () => clearTimeout(t);
    }
  }, [hasSeenSplash, hasAcceptedTerms]);

  if (Platform.OS === "web") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          backgroundColor: "#fff",
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "600" }}>BaguioQuest (Web)</Text>
        <Text style={{ color: "#555", textAlign: "center", maxWidth: 520 }}>
          Welcome! This web build doesn’t auto-redirect. Use the links below to open pages
          (make sure the corresponding files exist in <Text style={{ fontWeight: "700" }}>/app</Text>).
        </Text>

        {/* These links are safe; if a route doesn't exist you'll just see Not Found */}
        <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/splash" asChild>
            <Pressable style={btnStyle}><Text style={btnText}>Open Splash</Text></Pressable>
          </Link>
          <Link href="/terms" asChild>
            <Pressable style={btnStyle}><Text style={btnText}>Open Terms</Text></Pressable>
          </Link>
          <Link href="/(tabs)/map" asChild>
            <Pressable style={btnStyle}><Text style={btnText}>Open Map</Text></Pressable>
          </Link>
          <Link href="/" asChild>
            <Pressable style={[btnStyle, { backgroundColor: "#e9ecef" }]}>
              <Text style={[btnText, { color: "#111" }]}>Stay Here</Text>
            </Pressable>
          </Link>
        </View>

        <Text style={{ marginTop: 8, color: "#888", fontSize: 12 }}>
          Tip: add a <Text style={{ fontWeight: "700" }}>public/_redirects</Text> with “/* /index.html 200”
          for SPA routing on Netlify.
        </Text>
      </View>
    );
  }

  // Native: brief loader while redirecting
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
      <Text style={{ marginTop: 10, color: "#444" }}>Loading BaguioQuest…</Text>
    </View>
  );
}

const btnStyle = {
  paddingVertical: 10,
  paddingHorizontal: 14,
  backgroundColor: "#0b57d0",
  borderRadius: 8,
};
const btnText = { color: "#fff", fontWeight: "600" };
