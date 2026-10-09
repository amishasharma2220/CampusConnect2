import * as Linking from "expo-linking";
import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import type { ClubMembershipOrder, RazorpayResult } from "@/lib/api";
import { colors } from "@/lib/theme";

type Props = {
  order: ClubMembershipOrder;
  onSuccess: (r: RazorpayResult) => void;
  onDismiss: () => void;
  onError: (message: string) => void;
};

/**
 * Runs Razorpay's standard web Checkout inside a WebView, so payments work in
 * Expo Go without a native SDK. The backend still verifies the signature.
 */
export function RazorpayCheckout({ order, onSuccess, onDismiss, onError }: Props) {
  const html = useMemo(() => {
    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: "CampusConnect",
      description: `${order.club_name} membership`,
      prefill: { name: order.prefill_name, email: order.prefill_email },
      theme: { color: colors.primary },
    };
    return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>body{margin:0;background:${colors.bg};font-family:-apple-system,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;color:#667085}</style>
</head><body><p id="m">Opening secure checkout…</p>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
  function send(o){ window.ReactNativeWebView.postMessage(JSON.stringify(o)); }
  try {
    var opts = ${JSON.stringify(options)};
    opts.handler = function(r){ send({ type: "success", data: r }); };
    opts.modal = { ondismiss: function(){ send({ type: "dismiss" }); } };
    var rzp = new Razorpay(opts);
    rzp.on("payment.failed", function(r){ send({ type: "failed", message: (r && r.error && r.error.description) || "Payment failed." }); });
    rzp.open();
  } catch (e) {
    send({ type: "error", message: "Could not load Razorpay. Check your connection and try again." });
  }
</script></body></html>`;
  }, [order]);

  const onMessage = (ev: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(ev.nativeEvent.data) as { type: string; data?: RazorpayResult; message?: string };
      if (msg.type === "success" && msg.data) onSuccess(msg.data);
      else if (msg.type === "dismiss") onDismiss();
      else onError(msg.message ?? "Payment failed.");
    } catch {
      onError("Unexpected response from the payment page.");
    }
  };

  return (
    <WebView
      source={{ html, baseUrl: "https://checkout.razorpay.com" }}
      originWhitelist={["*"]}
      onMessage={onMessage}
      javaScriptEnabled
      domStorageEnabled
      startInLoadingState
      renderLoading={() => (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
      // UPI apps (upi://, tez://, phonepe://…) must open outside the WebView.
      onShouldStartLoadWithRequest={(req) => {
        if (/^(https?|about|data|blob):/i.test(req.url)) return true;
        Linking.openURL(req.url).catch(() => onError("No app found to complete this UPI payment."));
        return false;
      }}
      setSupportMultipleWindows={false}
      style={{ flex: 1, backgroundColor: colors.bg }}
    />
  );
}
