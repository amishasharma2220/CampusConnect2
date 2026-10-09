import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { colors, radius } from "@/lib/theme";

export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={18} color={colors.faint} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="never"
      />
      {value ? (
        <Pressable onPress={() => onChange("")} hitSlop={10} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color={colors.faint} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 46,
  },
  input: { flex: 1, fontSize: 16, color: colors.ink },
});
