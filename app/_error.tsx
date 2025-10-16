// app/_error.tsx
import { Text, View, ScrollView } from "react-native";

export default function GlobalError({ error }: { error: Error }) {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, padding: 16, gap: 12, alignItems: "flex-start" }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Something broke 😬</Text>
        <Text style={{ color: "#c00" }}>{String(error?.message || error)}</Text>
        <Text selectable style={{ fontFamily: "monospace", fontSize: 12 }}>
          {String(error?.stack || "")}
        </Text>
      </View>
    </ScrollView>
  );
}
