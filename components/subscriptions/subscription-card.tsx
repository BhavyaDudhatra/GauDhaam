"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, PauseCircle, PlayCircle, XCircle } from "lucide-react";
import {
  cancelSubscriptionAction,
  resumeSubscriptionAction,
} from "@/lib/actions/subscriptions";
import { formatDate } from "@/lib/money";
import { addressLines } from "@/lib/subscriptions";
import type { Subscription } from "@/lib/types";
import { PauseModal } from "./pause-modal";

type SubscriptionCardProps = {
  subscription: Subscription;
  productName: string;
};

const frequencyLabel: Record<Subscription["frequency"], string> = {
  daily: "Every day",
  weekly: "Every week",
  monthly: "Every month",
};

const statusBadge: Record<Subscription["status"], string> = {
  active: "badge-green",
  paused: "badge-brown",
  cancelled: "badge-neutral",
};

export function SubscriptionCard({
  subscription,
  productName,
}: SubscriptionCardProps) {
  const [pauseOpen, setPauseOpen] = useState(false);
  const cancelled = subscription.status === "cancelled";

  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[17px]">{productName}</h3>
          <p className="mt-1 text-[12.5px] text-body/80">
            {subscription.quantity} unit{subscription.quantity === 1 ? "" : "s"} ·{" "}
            {frequencyLabel[subscription.frequency]}
          </p>
          <p className="mt-1 text-[11.5px] text-body/70">
            Started {formatDate(subscription.startDate)}
          </p>
        </div>
        <span className={`badge capitalize ${statusBadge[subscription.status]}`}>
          {subscription.status}
        </span>
      </div>

      <p className="mt-3 text-[11.5px] leading-relaxed text-body/70">
        {addressLines(subscription.address).join(", ")}
      </p>

      {subscription.pausedIntervals.length > 0 && (
        <p className="mt-2 text-[11.5px] text-brown">
          Paused:{" "}
          {subscription.pausedIntervals
            .map((interval) => `${formatDate(interval.startDate)} → ${formatDate(interval.endDate)}`)
            .join(", ")}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/subscriptions/${subscription.id}`}
          className="btn btn-outline btn-sm"
        >
          <Calendar size={15} />
          View calendar
        </Link>

        {subscription.status === "active" && (
          <button
            type="button"
            onClick={() => setPauseOpen(true)}
            className="btn btn-outline btn-sm"
          >
            <PauseCircle size={15} />
            Pause subscription
          </button>
        )}

        {subscription.status === "paused" && (
          <form action={resumeSubscriptionAction}>
            <input type="hidden" name="id" value={subscription.id} />
            <button type="submit" className="btn btn-outline btn-sm">
              <PlayCircle size={15} />
              Resume
            </button>
          </form>
        )}

        {!cancelled && (
          <form
            action={cancelSubscriptionAction}
            onSubmit={(event) => {
              if (
                !window.confirm(
                  "Cancel this subscription? Future deliveries will stop.",
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={subscription.id} />
            <button
              type="submit"
              className="btn btn-ghost btn-sm text-brown hover:bg-[#F6EBE4]"
            >
              <XCircle size={15} />
              Cancel
            </button>
          </form>
        )}
      </div>

      {pauseOpen && (
        <PauseModal
          open
          onClose={() => setPauseOpen(false)}
          subscriptionId={subscription.id}
        />
      )}
    </article>
  );
}
