import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, ShoppingBag } from "lucide-react";
import { SubscriptionCard } from "@/components/subscriptions/subscription-card";
import { BillSummary } from "@/components/subscriptions/bill-summary";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { currentMonthKey, monthLabel } from "@/lib/subscriptions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Subscriptions",
  robots: { index: false, follow: false },
};

export default async function SubscriptionsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/subscriptions");

  const store = await getStore();
  const [subscriptions, products] = await Promise.all([
    store.subscriptions.list({ userId: session.id }),
    store.products.list({ includeUnavailable: true }),
  ]);
  const productNames = new Map(products.map((product) => [product.id, product.name]));

  const month = currentMonthKey();
  await Promise.all(
    subscriptions
      .filter((subscription) => subscription.status !== "cancelled")
      .map((subscription) =>
        store.dailyDeliveries.generateForSubscription(subscription.id, month),
      ),
  );

  const deliveries = await store.dailyDeliveries.list({
    userId: session.id,
    month,
  });
  const deliveredDays = deliveries.filter(
    (delivery) => delivery.status === "delivered",
  ).length;
  const pausedDays = deliveries.filter(
    (delivery) => delivery.status === "paused",
  ).length;
  const scheduledDays = deliveries.filter(
    (delivery) => delivery.status === "scheduled",
  ).length;
  const total = deliveries
    .filter((delivery) => delivery.status === "delivered")
    .reduce((sum, delivery) => sum + delivery.amountCharged, 0);

  const activeCount = subscriptions.filter(
    (subscription) => subscription.status === "active",
  ).length;

  return (
    <div className="container-gd py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Daily deliveries</span>
          <h1 className="mt-2">My Subscriptions</h1>
          <p className="mt-2 text-[13px] text-body/80">
            Manage recurring orders, pause for vacations, and track your running
            bill.
          </p>
        </div>
        <Link href="/shop" className="btn btn-outline btn-sm">
          <ShoppingBag size={15} />
          Add another product
        </Link>
      </div>

      {subscriptions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-[12px] text-body/75">
          <span>{subscriptions.length} total</span>
          <span>{activeCount} active</span>
          <span>
            {deliveredDays} delivered this month
          </span>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {subscriptions.length === 0 && (
            <div className="card flex flex-col items-center px-6 py-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-light text-brand">
                <CalendarClock size={24} strokeWidth={1.6} />
              </span>
              <h2 className="mt-3 text-[18px]">No subscriptions yet</h2>
              <p className="mt-1.5 max-w-sm text-[13px] text-body/80">
                Subscribe to daily essentials from any product page and we will
                deliver on your schedule.
              </p>
              <Link href="/shop" className="btn btn-primary btn-sm mt-4">
                Browse products
              </Link>
            </div>
          )}
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              productName={
                productNames.get(subscription.productId) ?? "Subscribed product"
              }
            />
          ))}
        </div>
        <BillSummary
          month={monthLabel(month)}
          deliveredDays={deliveredDays}
          pausedDays={pausedDays}
          scheduledDays={scheduledDays}
          total={total}
        />
      </div>
    </div>
  );
}
