"use client";
import { useState, useMemo } from "react";
import { useActionState } from "react";
import { addComplementaryGiftAction, deleteComplementaryGiftAction } from "@/lib/actions/admin";
import type { FormState } from "@/lib/actions/state";

type Item = { id: string; slug: string; name: string };

export function ComplementaryForm({ products, services, gifts }: { products: Item[]; services: Item[]; gifts: any[] }) {
  const [type, setType] = useState<"product" | "service">("product");
  const items = useMemo(() => type === "product" ? products : services, [type, products, services]);
  const [state, action, pending] = useActionState<FormState, FormData>(addComplementaryGiftAction, null);

  return (
    <div className="space-y-6">
      <h1 className="text-[22px]">Complementary Gifts / Services</h1>
      <form action={action} className="card p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field"><span className="label">Name</span><input name="name" required className="input"/></label>
          <label className="field"><span className="label">Type</span>
            <select name="type" className="input" value={type} onChange={e=>setType(e.target.value as any)}><option value="product">Product</option><option value="service">Service</option></select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field"><span className="label">Item</span>
            <select name="itemId" required className="input">
              <option value="">Select item</option>
              {items.map(i=> <option key={i.id} value={i.slug}>{i.name} ({i.slug})</option>)}
            </select>
          </label>
          <label className="field"><span className="label">Quantity</span>
            <input name="quantity" type="number" min="1" defaultValue="1" className="input"/>
          </label>
        </div>
        <label className="field"><span className="label">Notes</span><textarea name="notes" className="textarea"/></label>
        {state?.error && <p className="text-red-600 text-[12px]">{state.error}</p>}
        {state?.success && <p className="text-green-700 text-[12px]">{state.success}</p>}
        <button disabled={pending} className="btn btn-primary btn-sm">Add</button>
      </form>
      <div className="card p-4">
        <ul className="space-y-2">
          {gifts.map(g=>(
            <li key={g.id} className="border-b border-line py-2 text-[13px] flex justify-between items-center">
              <span>{g.name} - {g.type} - {g.itemId} {g.quantity ? `· Qty: ${g.quantity}` : ''}</span>
              <form action={deleteComplementaryGiftAction}>
                <input type="hidden" name="id" value={g.id} />
                <button className="text-[12px] text-red-600">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
