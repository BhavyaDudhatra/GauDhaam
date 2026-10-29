import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getSession } from "@/lib/auth";
import { isPaymentSimulationAllowed, isRazorpayConfigured } from "@/lib/razorpay";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await getSession();
  const store = await getStore();
  const user = session ? await store.users.get(session.id) : null;

  const paymentMode: "live" | "simulate" | "unavailable" = isRazorpayConfigured()
    ? "live"
    : isPaymentSimulationAllowed()
      ? "simulate"
      : "unavailable";

  return (
    <CheckoutForm
      paymentMode={paymentMode}
      defaults={{
        name: user?.name ?? session?.name ?? "",
        email: user?.email ?? session?.email ?? "",
        phone: user?.phone ?? "",
      }}
    />
  );
}
