import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { catColor, colors, radius, type } from "@/lib/theme";

export type IconName = ComponentProps<typeof Ionicons>["name"];

// ── Button ────────────────────────────────────────────────────────────────
type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = "primary", icon, loading, disabled, style }: ButtonProps) {
  const v = buttonVariants[variant];
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && !off && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        off && { opacity: 0.55 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={v.fg} />}
          <Text style={[styles.buttonText, { color: v.fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const buttonVariants = {
  primary: { bg: colors.primary, fg: "#fff", border: colors.primary },
  secondary: { bg: colors.card, fg: colors.ink, border: colors.border },
  ghost: { bg: "transparent", fg: colors.primaryDark, border: "transparent" },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
};

// ── Field ─────────────────────────────────────────────────────────────────
type FieldProps = TextInputProps & { label: string; error?: string | null; hint?: string };

export function Field({ label, error, hint, style, ...rest }: FieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.faint}
        style={[styles.input, error ? { borderColor: colors.danger } : null, style]}
        {...rest}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : hint ? <Text style={type.small}>{hint}</Text> : null}
    </View>
  );
}

// ── Chips ─────────────────────────────────────────────────────────────────
export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: colors.ink, borderColor: colors.ink }]}
    >
      <Text style={[styles.chipText, active && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

export function CategoryTag({ category }: { category: string }) {
  const c = catColor(category);
  return (
    <View style={[styles.tag, { backgroundColor: c.bg }]}>
      <Text style={[styles.tagText, { color: c.fg }]}>{category}</Text>
    </View>
  );
}

export function StatusTag({ label, tone }: { label: string; tone: "success" | "warning" | "danger" | "neutral" }) {
  const map = {
    success: [colors.successSoft, colors.success],
    warning: [colors.warningSoft, colors.warning],
    danger: [colors.dangerSoft, colors.danger],
    neutral: ["#EEF0F3", colors.muted],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color: fg }]}>{label}</Text>
    </View>
  );
}

// ── Layout bits ───────────────────────────────────────────────────────────
export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }, style]}>
      {children}
    </Pressable>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={type.title}>{title}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ color: colors.primaryDark, fontWeight: "600" }}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function InfoRow({ icon, label, value }: { icon: IconName; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.primaryDark} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.small}>{label}</Text>
        <Text style={[type.body, { fontWeight: "600" }]}>{value}</Text>
      </View>
    </View>
  );
}

export function Avatar({ label, size = 44, tint = colors.primary }: { label: string; size?: number; tint?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tint, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.38 }}>{label}</Text>
    </View>
  );
}

// ── States ────────────────────────────────────────────────────────────────
export function Loading({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <Text style={[type.small, { marginTop: 12, textAlign: "center" }]}>{label}</Text> : null}
    </View>
  );
}

export function EmptyState({ icon, title, body, action, onAction }: { icon: IconName; title: string; body?: string; action?: string; onAction?: () => void }) {
  return (
    <View style={[styles.center, { paddingVertical: 48 }]}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={28} color={colors.primaryDark} />
      </View>
      <Text style={[type.heading, { marginTop: 14, textAlign: "center" }]}>{title}</Text>
      {body ? <Text style={[type.small, { marginTop: 6, textAlign: "center", maxWidth: 280 }]}>{body}</Text> : null}
      {action ? <Button title={action} onPress={onAction} variant="secondary" style={{ marginTop: 18, alignSelf: "center" }} /> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <EmptyState icon="cloud-offline-outline" title="Couldn't load this" body={message} action={onRetry ? "Try again" : undefined} onAction={onRetry} />;
}

export function Banner({ tone = "danger", text }: { tone?: "danger" | "success" | "warning"; text: string }) {
  const bg = tone === "danger" ? colors.dangerSoft : tone === "success" ? colors.successSoft : colors.warningSoft;
  const fg = tone === "danger" ? colors.danger : tone === "success" ? colors.success : colors.warning;
  const icon: IconName = tone === "danger" ? "alert-circle" : tone === "success" ? "checkmark-circle" : "information-circle";
  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={18} color={fg} />
      <Text style={{ color: fg, flex: 1, fontWeight: "500" }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: colors.navy },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.card,
  },
  fieldError: { color: colors.danger, fontSize: 13 },
  chip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    justifyContent: "center",
  },
  chipText: { fontSize: 14, fontWeight: "600", color: colors.navy },
  tag: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  tagText: { fontSize: 12, fontWeight: "700" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  infoRow: { flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 8 },
  infoIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  banner: { flexDirection: "row", gap: 10, alignItems: "center", padding: 12, borderRadius: radius.md },
});
