import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { BillSummary } from "@/components/subscriptions/bill-summary";
import { DeliveryCalendar } from "@/components/subscriptions/delivery-calendar";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import {
  currentMonthKey,
  isMonthKey,
  monthLabel,
  productUnitPrice,
  shiftMonth,
  addressLines,
} from "@/lib/subscriptions";
import { formatDate, formatINR } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscription calendar",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
};

const frequencyLabel = {
  daily: "Every day",
  weekly: "Every week",
  monthly: "Every month",
} as const;

export default async function SubscriptionDetailPage({
  params,
  searchParams,
}: PageProps) {
  const session = await getSession();
  const { id } = await params;
  if (!session) redirect(`/login?next=${encodeURIComponent(`/subscriptions/${id}`)}`);

  const { month: monthParam } = await searchParams;
  const month = isMonthKey(monthParam) ? monthParam! : currentMonthKey();

  const store = await getStore();
  const subscription = await store.subscriptions.get(id);
  if (!subscription || subscription.userId !== session.id) notFound();

  const product = await store.products.get(subscription.productId);
  if (subscription.status !== "cancelled") {
    await store.dailyDeliveries.generateForSubscription(subscription.id, month);
  }
  const deliveries = await store.dailyDeliveries.list({
    subscriptionId: subscription.id,
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
  const unitPrice = productUnitPrice(product);

  const previousMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);

  return (
    <div className="container-gd py-8 md:py-10">
      <Link
        href="/subscriptions"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline"
      >
        <ArrowLeft size={14} />
        All subscriptions
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow">Delivery calendar</span>
          <h1 className="mt-2">{product?.name ?? "Subscription"}</h1>
          <p className="mt-2 text-[13px] text-body/80">
            {subscription.quantity} unit
            {subscription.quantity === 1 ? "" : "s"} ·{" "}
            {frequencyLabel[subscription.frequency]}
            {unitPrice > 0 ? ` · ${formatINR(unitPrice)} per unit` : ""}
          </p>
        </div>
        <span
          className={`badge capitalize ${
            subscription.status === "active"
              ? "badge-green"
              : subscription.status === "paused"
                ? "badge-brown"
                : "badge-neutral"
          }`}
        >
          {subscription.status}
        </span>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="card p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[17px]">{monthLabel(month)}</h2>
            <div className="flex items-center gap-1">
              <Link
                href={`/subscriptions/${subscription.id}?month=${previousMonth}`}
                className="btn btn-ghost btn-sm"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </Link>
              <Link
                href={`/subscriptions/${subscription.id}?month=${nextMonth}`}
                className="btn btn-ghost btn-sm"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
          <div className="mt-4">
            <DeliveryCalendar month={month} deliveries={deliveries} />
          </div>
        </div>

        <div className="space-y-4">
          <BillSummary
            month={monthLabel(month)}
            deliveredDays={deliveredDays}
            pausedDays={pausedDays}
            scheduledDays={scheduledDays}
            total={total}
          />

          <div className="card p-5 text-[12.5px]">
            <h3 className="text-[15px]">Delivery details</h3>
            <dl className="mt-3 space-y-2.5">
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-body/60">
                  Started
                </dt>
                <dd>{formatDate(subscription.startDate)}</dd>
              </div>
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-body/60">
                  Address
                </dt>
                <dd className="text-body/85">
                  {subscription.address.name}
                  <br />
                  {addressLines(subscription.address).join(", ")}
                  <br />
                  {subscription.address.phone}
                </dd>
              </div>
              {subscription.pausedIntervals.length > 0 && (
                <div>
                  <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-body/60">
                    Pause windows
                  </dt>
                  <dd className="text-body/85">
                    {subscription.pausedIntervals
                      .map(
                        (interval) =>
                          `${formatDate(interval.startDate)} → ${formatDate(interval.endDate)}`,
                      )
                      .join(", ")}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
