import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";

import { RazorpayCheckout } from "@/components/RazorpayCheckout";
import { Banner, Button, Card, Chip, EmptyState, ErrorState, Field, Loading } from "@/components/ui";
import { clubsApi, paymentsApi, WEB_URL, type ClubMembershipOrder, type RazorpayResult } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { rupees } from "@/lib/format";
import { colors, type } from "@/lib/theme";
import { useQuery } from "@/lib/useQuery";

const YEARS = ["1st", "2nd", "3rd", "4th"];

type Step = "details" | "paying" | "verifying" | "done";

export default function JoinClub() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const club = useQuery(() => clubsApi.get(slug), [slug], { refetchOnFocus: false });
  const [year, setYear] = useState(user?.year_of_study ?? "");
  const [branch, setBranch] = useState(user?.branch ?? "");
  const [step, setStep] = useState<Step>("details");
  const [order, setOrder] = useState<ClubMembershipOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (club.loading) return <Loading />;
  if (club.error || !club.data) return <ErrorState message={club.error ?? "Club not found."} onRetry={club.reload} />;
  const c = club.data;

  const startPayment = async () => {
    setBusy(true);
    setError(null);
    try {
      const o = await paymentsApi.createClubOrder(c.slug);
      setOrder(o);
      setStep("paying");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (r: RazorpayResult) => {
    setStep("verifying");
    try {
      await paymentsApi.verify({ ...r, year: year || undefined, branch: branch.trim() || undefined });
      setStep("done");
    } catch (e) {
      setError(`${(e as Error).message} If money was deducted, contact the club with payment ID ${r.razorpay_payment_id}.`);
      setStep("details");
    }
  };

  if (step === "paying" && order) {
    return (
      <RazorpayCheckout
        order={order}
        onSuccess={verify}
        onDismiss={() => {
          setError("Payment cancelled. You haven't been charged.");
          setStep("details");
        }}
        onError={(m) => {
          setError(m);
          setStep("details");
        }}
      />
    );
  }

  if (step === "verifying") return <Loading label="Confirming your payment…" />;

  if (step === "done") {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <EmptyState icon="ribbon-outline" title={`Welcome to ${c.short_name || c.name}!`} body="Your membership is active. The club team will reach out with next steps." />
        <Button title="Done" onPress={() => router.back()} />
      </View>
    );
  }

  const webOnly = Platform.OS === "web";

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View>
        <Text style={type.label}>Membership</Text>
        <Text style={[type.title, { marginTop: 4 }]}>{c.name}</Text>
      </View>

      {error ? <Banner text={error} /> : null}

      {!c.fee ? (
        <Banner
          tone="warning"
          text={`${c.short_name || c.name} doesn't take online sign-ups. Reach out to the club${c.email ? ` at ${c.email}` : ""} to join.`}
        />
      ) : (
        <>
          <Card style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={type.heading}>Annual membership</Text>
              <Text style={type.small}>One-time payment via Razorpay</Text>
            </View>
            <Text style={[type.title, { color: colors.primaryDark }]}>{rupees(c.fee)}</Text>
          </Card>

          <Field label="Branch" value={branch} onChangeText={setBranch} placeholder="e.g. CSE" />
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.navy }}>Year of study</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {YEARS.map((y) => (
                <Chip key={y} label={y} active={year === y} onPress={() => setYear(y)} />
              ))}
            </View>
          </View>

          {webOnly ? (
            <Button title="Continue on the website" onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/clubs`)} />
          ) : (
            <Button title={`Pay ${rupees(c.fee)}`} icon="lock-closed-outline" loading={busy} onPress={startPayment} style={{ marginTop: 8 }} />
          )}
          <Text style={[type.small, { textAlign: "center" }]}>Payments are processed securely by Razorpay. Test mode cards work while the club is in test mode.</Text>
        </>
      )}
    </ScrollView>
  );
}
