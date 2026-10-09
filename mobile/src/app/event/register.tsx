import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

import { Banner, Button, Chip, EmptyState, Field } from "@/components/ui";
import { eventsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { colors, type } from "@/lib/theme";

const YEARS = ["1st", "2nd", "3rd", "4th"];

export default function RegisterForEvent() {
  const { slug, title } = useLocalSearchParams<{ slug: string; title?: string }>();
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name ?? "",
    email: user?.email ?? "",
    phone: "",
    branch: user?.branch ?? "",
    year_of_study: user?.year_of_study ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (form.phone && !/^[+\d][\d\s-]{7,}$/.test(form.phone.trim())) {
      setError("Enter a valid phone number.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await eventsApi.register(slug, {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        branch: form.branch.trim() || undefined,
        year_of_study: form.year_of_study || undefined,
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <EmptyState icon="checkmark-done-circle-outline" title="You're in!" body={`Your spot for ${title ?? "this event"} is confirmed. It now shows under My events.`} />
        <Button title="Done" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {title ? (
          <View>
            <Text style={type.label}>Registering for</Text>
            <Text style={[type.title, { marginTop: 4 }]}>{title}</Text>
          </View>
        ) : null}
        {error ? <Banner text={error} /> : null}
        <Field label="Full name" value={form.full_name} onChangeText={set("full_name")} autoComplete="name" />
        <Field label="Email" value={form.email} onChangeText={set("email")} autoCapitalize="none" keyboardType="email-address" />
        <Field label="Phone" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" placeholder="Optional" autoComplete="tel" />
        <Field label="Branch" value={form.branch} onChangeText={set("branch")} placeholder="e.g. CSE" />
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.navy }}>Year of study</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {YEARS.map((y) => (
              <Chip key={y} label={y} active={form.year_of_study === y} onPress={() => set("year_of_study")(y)} />
            ))}
          </View>
        </View>
        <Button title="Confirm registration" onPress={submit} loading={busy} style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
