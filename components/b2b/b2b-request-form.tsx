"use client";
// B2B request form updated for bulk/hamper options

import { useActionState, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { submitB2BRequestAction } from "@/lib/actions/b2b";
import type { FormState } from "@/lib/actions/state";

type B2BRequestFormProps = {
  defaultContactName?: string;
  defaultPhone?: string;
};

const initialState: FormState = null;

export function B2BRequestForm({
  defaultContactName = "",
  defaultPhone = "",
}: B2BRequestFormProps) {
  const [state, formAction, pending] = useActionState(
    submitB2BRequestAction,
    initialState,
  );
  const [pickup, setPickup] = useState<"self"|"delivery">("delivery");

  if (state?.success) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-light text-brand">
          <CheckCircle2 size={26} strokeWidth={1.6} />
        </span>
        <h2 className="mt-3 text-[18px]">Inquiry received</h2>
        <p className="mt-2 max-w-md text-[13px] leading-relaxed text-body/80">
          {state.success}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/shop" className="btn btn-outline btn-sm">
            Browse products
          </Link>
          <Link href="/b2b/contact" className="btn btn-ghost btn-sm">
            Contact the team
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex gap-3">
        <label className="flex items-center gap-2">
          <input type="radio" name="orderType" value="bulk" defaultChecked required /> Bulk buying
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="orderType" value="hamper" required /> Hampers order
        </label>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="field">
          <span className="label">Full name</span>
          <input name="fullName" required className="input" placeholder="Your name" defaultValue={defaultContactName} />
        </label>
        <label className="field">
          <span className="label">Phone</span>
          <input name="phone" type="tel" required className="input" placeholder="10-digit mobile" defaultValue={defaultPhone} />
        </label>
      </div>
      <label className="field">
        <span className="label">GST number <span className="text-[11px] text-body/60">(optional)</span></span>
        <input name="gstNumber" className="input" placeholder="15-digit GSTIN" />
      </label>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="field">
          <span className="label">Item name</span>
          <input name="itemName" required className="input" placeholder="Product / hamper description" />
        </label>
        <label className="field">
          <span className="label">Quantity</span>
          <input name="quantity" type="number" min="1" required className="input" placeholder="e.g. 100" />
        </label>
      </div>
      <div className="flex gap-3">
        <label className="flex items-center gap-2">
          <input type="radio" name="pickupOption" value="self" onChange={()=>setPickup('self')} required /> Self pickup
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="pickupOption" value="delivery" defaultChecked onChange={()=>setPickup('delivery')} required /> Delivery
        </label>
      </div>
      {pickup === 'delivery' && (
        <label className="field">
          <span className="label">Full address</span>
          <textarea name="address" required className="textarea" placeholder="House no, street, city, pincode" />
        </label>
      )}
      <label className="field">
        <span className="label">Deadline for delivery</span>
        <input name="deadline" type="date" required className="input" />
      </label>
      <label className="field">
        <span className="label">Notes</span>
        <textarea name="notes" className="textarea" placeholder="Any specific requirements" />
      </label>

      {state?.error && (
        <p className="rounded-card border border-brown/30 bg-[#F6EBE4] p-3 text-[12.5px] font-semibold text-brown">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Submitting..." : "Request bulk quote"}
      </button>
    </form>
  );
}
