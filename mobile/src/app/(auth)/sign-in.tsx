import { Link } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { AuthScreen } from "@/components/AuthScreen";
import { Banner, Button, Field } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { colors, type } from "@/lib/theme";

export default function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <AuthScreen title="Welcome back" subtitle="Sign in to find events, join clubs and track your registrations.">
      {error ? <Banner text={error} /> : null}
      <Field
        label="University email"
        placeholder="you@muj.manipal.edu"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
        returnKeyType="next"
      />
      <Field
        label="Password"
        placeholder="••••••••"
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        value={password}
        onChangeText={setPassword}
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <Button title="Sign in" onPress={submit} loading={busy} style={{ marginTop: 8 }} />
      {busy ? <Text style={[type.small, { textAlign: "center" }]}>The server may take up to a minute to wake up on first use.</Text> : null}
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 12 }}>
        <Text style={type.small}>New to CampusConnect? </Text>
        <Link href="/sign-up" replace style={{ color: colors.primaryDark, fontWeight: "700", fontSize: 13 }}>
          Create an account
        </Link>
      </View>
    </AuthScreen>
  );
}
