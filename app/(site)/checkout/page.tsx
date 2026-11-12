import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
  if (!session) {
    redirect("/login?next=%2Fcheckout");
  }
  const store = await getStore();
  const user = await store.users.get(session.id);
  if (!user) {
    redirect("/login?next=%2Fcheckout");
  }

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
      addresses={user?.addresses ?? []}
    />
  );
}
