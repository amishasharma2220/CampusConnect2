import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

import { Banner, Button, Chip, EmptyState, ErrorState, Field, Loading } from "@/components/ui";
import { clubAdminRequestsApi } from "@/lib/api";
import { colors, type } from "@/lib/theme";
import { useQuery } from "@/lib/useQuery";

export default function RequestAdminAccess() {
  const { slug, name } = useLocalSearchParams<{ slug: string; name?: string }>();
  const positions = useQuery(() => clubAdminRequestsApi.positions(), [], { refetchOnFocus: false });
  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (positions.loading) return <Loading />;
  if (positions.error) return <ErrorState message={positions.error} onRetry={positions.reload} />;

  const submit = async () => {
    if (!position) {
      setError("Pick your position in the club.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await clubAdminRequestsApi.create({ club_slug: slug, position, message: message.trim() || undefined });
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
        <EmptyState icon="hourglass-outline" title="Request sent" body="A university admin will review it. You can track the status from your profile." />
        <Button title="Done" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={type.label}>Admin access for</Text>
          <Text style={[type.title, { marginTop: 4 }]}>{name ?? slug}</Text>
          <Text style={[type.small, { marginTop: 6 }]}>
            Club admins can create events, view registrations and manage the club budget. A university admin approves every request.
          </Text>
        </View>
        {error ? <Banner text={error} /> : null}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.navy }}>Your position</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {(positions.data ?? []).map((p) => (
              <Chip key={p} label={p} active={position === p} onPress={() => setPosition(p)} />
            ))}
          </View>
        </View>
        <Field
          label="Message (optional)"
          value={message}
          onChangeText={setMessage}
          placeholder="Anything that helps the admin verify you"
          multiline
          maxLength={1000}
          style={{ minHeight: 100, paddingTop: 12, textAlignVertical: "top" }}
        />
        <Button title="Send request" onPress={submit} loading={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
