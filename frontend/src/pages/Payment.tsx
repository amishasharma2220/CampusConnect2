import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, IndianRupee, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { paymentsApi, type RazorpayCheckoutResult } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

/** State passed to /payment via navigate("/payment", { state }). */
export interface PaymentState {
  amount: number; // INR, for display only; the server decides the real amount
  title: string;
  subtitle?: string;
  returnTo: string;
  meta?: Record<string, string>; // clubId (= club slug), year, branch
}

// ── Razorpay Checkout (loaded from Razorpay's CDN on demand) ──────────────
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (result: RazorpayCheckoutResult) => void;
  modal: { ondismiss: () => void };
}
interface RazorpayInstance {
  open(): void;
  on(event: "payment.failed", handler: (response: { error: { description: string } }) => void): void;
}
declare global {
  interface Window { Razorpay?: new (options: RazorpayOptions) => RazorpayInstance }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay. Check your connection and try again."));
    document.body.appendChild(script);
  });
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const payment = location.state as PaymentState | null;
  const [busy, setBusy] = useState(false);

  if (!payment?.meta?.clubId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="font-display text-2xl font-bold text-foreground">Nothing to pay for</h1>
          <p className="text-muted-foreground">Start from the club you want to join, and you'll be brought back here to pay.</p>
          <Button asChild className="rounded-xl"><Link to="/join-club">Join a Club</Link></Button>
        </div>
      </div>
    );
  }

  const { meta } = payment;
  // Only ever return to a path inside this app (defence against open redirects).
  const returnTo = /^\/(?![/\\])/.test(payment.returnTo) ? payment.returnTo : "/join-club";

  const startPayment = async () => {
    setBusy(true);
    try {
      const order = await paymentsApi.createClubMembershipOrder(meta.clubId);
      await loadCheckoutScript();
      if (!window.Razorpay) throw new Error("Razorpay failed to load.");

      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "CampusConnect",
        description: `Membership: ${order.club_name}`,
        prefill: { name: order.prefill_name, email: order.prefill_email },
        theme: { color: "#b45309" },
        handler: async (result) => {
          try {
            const verified = await paymentsApi.verify({ ...result, year: meta.year, branch: meta.branch });
            navigate(returnTo, { state: { paid: true, txnId: verified.payment_id, meta } });
          } catch (err: unknown) {
            toast({ title: "Payment received but not confirmed", description: getErrorMessage(err), variant: "destructive" });
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      checkout.on("payment.failed", (response) => {
        toast({ title: "Payment failed", description: response.error.description, variant: "destructive" });
      });
      checkout.open();
    } catch (err: unknown) {
      toast({ title: "Couldn't start payment", description: getErrorMessage(err), variant: "destructive" });
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-lg">
        <Link to={returnTo} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{payment.title}</h1>
              {payment.subtitle && <p className="text-sm text-muted-foreground mt-1">{payment.subtitle}</p>}
            </div>
            <Badge variant="outline">Checkout</Badge>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-display text-2xl font-bold text-foreground inline-flex items-center">
              <IndianRupee className="w-5 h-5" />{payment.amount}
            </span>
          </div>

          <Button onClick={startPayment} disabled={busy} className="w-full bg-hero-gradient text-primary-foreground rounded-xl h-11">
            <Lock className="w-4 h-4 mr-2" />
            {busy ? "Opening secure checkout…" : `Pay ₹${payment.amount}`}
          </Button>

          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-primary" />
            Payments are processed by Razorpay. Your membership is confirmed only after the payment is verified by our server.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
