"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { submitB2BRequestAction } from "@/lib/actions/b2b";
import type { FormState } from "@/lib/actions/state";

type ProductOption = { id: string; name: string };

type B2BRequestFormProps = {
  products: ProductOption[];
  defaultContactName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
};

const initialState: FormState = null;

export function B2BRequestForm({
  products,
  defaultContactName = "",
  defaultEmail = "",
  defaultPhone = "",
}: B2BRequestFormProps) {
  const [state, formAction, pending] = useActionState(
    submitB2BRequestAction,
    initialState,
  );

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="field">
          <span className="label">Company name</span>
          <input
            name="companyName"
            required
            className="input"
            placeholder="Business name"
          />
        </label>
        <label className="field">
          <span className="label">Contact person</span>
          <input
            name="contactName"
            required
            className="input"
            defaultValue={defaultContactName}
            placeholder="Who should we speak to?"
          />
        </label>
        <label className="field">
          <span className="label">Email</span>
          <input
            name="email"
            type="email"
            required
            className="input"
            defaultValue={defaultEmail}
            placeholder="you@business.com"
          />
        </label>
        <label className="field">
          <span className="label">Phone</span>
          <input
            name="phone"
            type="tel"
            required
            className="input"
            defaultValue={defaultPhone}
            placeholder="10-digit mobile number"
          />
        </label>
        <label className="field">
          <span className="label">GST number (optional)</span>
          <input name="gstNumber" className="input" placeholder="15-digit GSTIN" />
        </label>
        <label className="field">
          <span className="label">Product</span>
          <select name="productId" required className="input" defaultValue="">
            <option value="" disabled>
              Choose a product
            </option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="label">Quantity needed</span>
          <input
            name="quantity"
            type="number"
            min={1}
            max={100000}
            required
            className="input"
            placeholder="e.g. 100"
          />
        </label>
        <label className="field">
          <span className="label">Delivery frequency</span>
          <select name="frequency" className="input" defaultValue="weekly">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span className="label">Packaging preferences</span>
        <input
          name="packagingDetails"
          className="input"
          placeholder="e.g. 1L pouches, 5kg tins, branded cartons"
        />
      </label>

      <label className="field">
        <span className="label">Specific requirements</span>
        <textarea
          name="customNotes"
          className="textarea"
          placeholder="Delivery dates, special instructions, tender details..."
        />
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
