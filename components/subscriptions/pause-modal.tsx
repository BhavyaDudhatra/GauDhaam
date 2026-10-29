"use client";

import { useActionState, useEffect } from "react";
import { X } from "lucide-react";
import { pauseSubscriptionAction } from "@/lib/actions/subscriptions";
import type { FormState } from "@/lib/actions/state";

type PauseModalProps = {
  open: boolean;
  onClose: () => void;
  subscriptionId: string;
};

const initialState: FormState = null;

function todayKey() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function PauseModal({ open, onClose, subscriptionId }: PauseModalProps) {
  const [state, formAction, pending] = useActionState(
    pauseSubscriptionAction,
    initialState,
  );

  useEffect(() => {
    if (!state?.success) return;
    const timer = setTimeout(onClose, 1200);
    return () => clearTimeout(timer);
  }, [state, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px]">Pause subscription</h3>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={16} />
          </button>
        </div>
        <p className="mt-1 text-[12.5px] text-body/80">
          No deliveries or charges inside this window. You can resume any time.
        </p>

        {state?.success ? (
          <p className="mt-4 rounded-card border border-brand/25 bg-light/70 p-3 text-[12.5px] font-semibold text-brand-dark">
            {state.success}
          </p>
        ) : (
          <form action={formAction} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={subscriptionId} />
            <label className="field">
              <span className="label">Start date</span>
              <input
                type="date"
                name="startDate"
                min={todayKey()}
                defaultValue={todayKey()}
                className="input"
                required
              />
            </label>
            <label className="field">
              <span className="label">End date</span>
              <input
                type="date"
                name="endDate"
                min={todayKey()}
                defaultValue={todayKey()}
                className="input"
                required
              />
            </label>

            {state?.error && (
              <p className="rounded-card border border-brown/30 bg-[#F6EBE4] p-3 text-[12.5px] font-semibold text-brown">
                {state.error}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={pending}
                className="btn btn-primary flex-1"
              >
                {pending ? "Pausing..." : "Pause"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
