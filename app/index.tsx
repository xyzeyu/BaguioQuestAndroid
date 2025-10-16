// app/index.tsx
import { useEffect } from "react";
import { View, Text, Platform, Pressable } from "react-native";
import { router, Link } from "expo-router";

export default function IndexScreen() {
  useEffect(() => {
    // Only auto-redirect on native platforms
    if (Platform.OS !== "web") {
      const timer = setTimeout(() => {
        try {
          // Replace with your real routing logic for Android/iOS
          router.replace("/splash");
        } catch (err) {
          console.error("Navigation error:", err);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Web: show safe landing screen (no auto nav)
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        padding: 24,
        gap: 16,
      }}
    >
      <Text style={{ fontSize: 26, fontWeight: "700", color: "#222" }}>
        BaguioQuest PWA
      </Text>
      <Text
        style={{
          color: "#555",
          textAlign: "center",
          fontSize: 15,
          maxWidth: 480,
          lineHeight: 22,
        }}
      >
        Welcome to the web version of BaguioQuest!  
        This page ensures stable loading on Netlify while we connect routes.
      </Text>

      <View
        style={{
          flexDirection: "row",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        <Link href="/splash" asChild>
          <Pressable style={btnStyle}>
            <Text style={btnText}>Go to Splash</Text>
          </Pressable>
        </Link>
        <Link href="/terms" asChild>
          <Pressable style={btnStyle}>
            <Text style={btnText}>Go to Terms</Text>
          </Pressable>
        </Link>
        <Link href="/(tabs)/map" asChild>
          <Pressable style={btnStyle}>
            <Text style={btnText}>Open Map</Text>
          </Pressable>
        </Link>
      </View>

      <Text
        style={{
          marginTop: 12,
          fontSize: 12,
          color: "#888",
          textAlign: "center",
        }}
      >
        ⚙️ Tip: Add <Text style={{ fontWeight: "bold" }}>public/_redirects</Text>  
        with “/* /index.html 200” for proper routing on Netlify.
      </Text>
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
