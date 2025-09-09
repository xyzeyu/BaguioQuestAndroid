import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

export default function StickyBanner({
  kind = "warning",
  text,
  onPress
}: {
  kind?: "warning" | "ok" | "error";
  text: ReactNode;
  onPress?: () => void;
}) {
  const bg = kind === "ok" ? "#0a7b34" : kind === "error" ? "#9b111e" : "#b36b00";
  return (
    <Pressable onPress={onPress} style={{ position: "absolute", top: 12, left: 12, right: 12, zIndex: 50 }}>
      <View style={{ backgroundColor: bg, padding: 12, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 }}>
        <Text style={{ color: "white", fontWeight: "700" }}>{text}</Text>
      </View>
    </Pressable>
  );
}
