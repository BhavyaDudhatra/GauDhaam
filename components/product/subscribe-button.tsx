"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CalendarClock, X } from "lucide-react";
import { createSubscriptionAction } from "@/lib/actions/subscriptions";
import type { FormState } from "@/lib/actions/state";

type SubscribeButtonProps = {
  productId: string;
  productName: string;
  productSlug: string;
  signedIn: boolean;
  defaultName?: string;
  defaultPhone?: string;
};

const initialState: FormState = null;

function todayKey() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function SubscribeButton({
  productId,
  productName,
  productSlug,
  signedIn,
  defaultName = "",
  defaultPhone = "",
}: SubscribeButtonProps) {
  const [state, formAction, pending] = useActionState(
    createSubscriptionAction,
    initialState,
  );
  const [open, setOpen] = useState(false);

  if (!signedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/product/${productSlug}`)}`}
        className="btn btn-outline w-full"
      >
        <CalendarClock size={16} />
        Sign in to subscribe &amp; save
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-outline w-full"
      >
        <CalendarClock size={16} />
        Subscribe &amp; save
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-card border border-line bg-cream p-6 text-body shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[18px]">Subscribe to {productName}</h3>
                <p className="mt-1 text-[12.5px] text-body/80">
                  Recurring delivery, pause or cancel whenever you need.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-ghost btn-sm"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {state?.success ? (
              <div className="mt-5 space-y-4">
                <p className="rounded-card border border-brand/25 bg-light/70 p-3 text-[12.5px] font-semibold text-brand-dark">
                  {state.success}
                </p>
                <div className="flex gap-2">
                  <Link href="/subscriptions" className="btn btn-primary flex-1">
                    View my subscriptions
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn btn-outline flex-1"
                  >
                    Keep shopping
                  </button>
                </div>
              </div>
            ) : (
              <form action={formAction} className="mt-5 space-y-3">
              <input type="hidden" name="productId" value={productId} />

              <div className="grid grid-cols-2 gap-3">
                <label className="field">
                  <span className="label">Frequency</span>
                  <select name="frequency" defaultValue="daily" className="input">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>
                <label className="field">
                  <span className="label">Quantity per delivery</span>
                  <input
                    name="quantity"
                    type="number"
                    min={1}
                    max={50}
                    defaultValue={1}
                    className="input"
                    required
                  />
                </label>
              </div>

              <label className="field">
                <span className="label">Start date</span>
                <input
                  name="startDate"
                  type="date"
                  min={todayKey()}
                  defaultValue={todayKey()}
                  className="input"
                />
              </label>

              <div className="border-t border-line pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-body/65">
                  Delivery address
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <label className="field col-span-2 sm:col-span-1">
                    <span className="label">Full name</span>
                    <input
                      name="name"
                      defaultValue={defaultName}
                      className="input"
                      required
                    />
                  </label>
                  <label className="field col-span-2 sm:col-span-1">
                    <span className="label">Phone</span>
                    <input
                      name="phone"
                      type="tel"
                      defaultValue={defaultPhone}
                      className="input"
                      required
                    />
                  </label>
                  <label className="field col-span-2">
                    <span className="label">Address line 1</span>
                    <input name="line1" className="input" required />
                  </label>
                  <label className="field col-span-2">
                    <span className="label">Address line 2 (optional)</span>
                    <input name="line2" className="input" />
                  </label>
                  <label className="field">
                    <span className="label">City</span>
                    <input name="city" className="input" required />
                  </label>
                  <label className="field">
                    <span className="label">State</span>
                    <input name="state" className="input" required />
                  </label>
                  <label className="field col-span-2 sm:col-span-1">
                    <span className="label">PIN code</span>
                    <input
                      name="pincode"
                      inputMode="numeric"
                      maxLength={6}
                      className="input"
                      required
                    />
                  </label>
                </div>
              </div>

              {state?.error && (
                <p className="rounded-card border border-brown/30 bg-[#F6EBE4] p-3 text-[12.5px] font-semibold text-brown">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="btn btn-primary w-full"
              >
                {pending ? "Starting subscription..." : "Start subscription"}
              </button>
            </form>
          )}
          </div>
        </div>
      )}
    </>
  );
}
