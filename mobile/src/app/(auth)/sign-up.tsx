import { Link } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { AuthScreen } from "@/components/AuthScreen";
import { Banner, Button, Chip, Field } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { colors, type } from "@/lib/theme";

const YEARS = ["1st", "2nd", "3rd", "4th"];

export default function SignUp() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", registration_number: "", branch: "", year_of_study: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email.";
    if (form.password.length < 8) e.password = "Use at least 8 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    setError(null);
    try {
      await signUp({
        full_name: form.full_name.trim(),
        email: form.email,
        password: form.password,
        registration_number: form.registration_number.trim() || undefined,
        branch: form.branch.trim() || undefined,
        year_of_study: form.year_of_study || undefined,
      });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <AuthScreen title="Create your account" subtitle="One account for every club and event at MUJ.">
      {error ? <Banner text={error} /> : null}
      <Field label="Full name" placeholder="Aarav Mehta" autoComplete="name" value={form.full_name} onChangeText={set("full_name")} error={errors.full_name} />
      <Field
        label="University email"
        placeholder="you@muj.manipal.edu"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={form.email}
        onChangeText={set("email")}
        error={errors.email}
      />
      <Field
        label="Password"
        placeholder="At least 8 characters"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        value={form.password}
        onChangeText={set("password")}
        error={errors.password}
      />
      <Field label="Registration number" placeholder="Optional" autoCapitalize="characters" value={form.registration_number} onChangeText={set("registration_number")} />
      <Field label="Branch" placeholder="e.g. CSE" value={form.branch} onChangeText={set("branch")} />
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.navy }}>Year of study</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {YEARS.map((y) => (
            <Chip key={y} label={y} active={form.year_of_study === y} onPress={() => set("year_of_study")(form.year_of_study === y ? "" : y)} />
          ))}
        </View>
      </View>
      <Button title="Create account" onPress={submit} loading={busy} style={{ marginTop: 8 }} />
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 12, marginBottom: 24 }}>
        <Text style={type.small}>Already have an account? </Text>
        <Link href="/sign-in" replace style={{ color: colors.primaryDark, fontWeight: "700", fontSize: 13 }}>
          Sign in
        </Link>
      </View>
    </AuthScreen>
  );
}
