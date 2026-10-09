import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, type } from "@/lib/theme";

/** Shared shell for sign-in / sign-up: brand mark, heading, scrollable form. */
export function AuthScreen({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.mark}>
              <Text style={styles.markText}>CC</Text>
            </View>
            <Text style={styles.brandName}>
              Campus<Text style={{ color: colors.primary }}>Connect</Text>
            </Text>
          </View>
          <Text style={type.display}>{title}</Text>
          <Text style={[type.small, { fontSize: 15, marginTop: 6, marginBottom: 28 }]}>{subtitle}</Text>
          <View style={{ gap: 16 }}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingTop: 40, flexGrow: 1 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 40 },
  mark: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  markText: { color: colors.primary, fontWeight: "900", fontSize: 16 },
  brandName: { fontSize: 20, fontWeight: "800", color: colors.ink, letterSpacing: -0.4 },
});
