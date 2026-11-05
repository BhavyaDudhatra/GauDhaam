"use client";
import { useState, useMemo } from "react";
import { useActionState } from "react";

type Item = { id: string; slug: string; name: string };

export function ComplementaryForm({ products, services, gifts }: { products: Item[]; services: Item[]; gifts: any[] }) {
  const [type, setType] = useState<"product" | "service">("product");
  const items = useMemo(() => type === "product" ? products : services, [type, products, services]);

  return (
    <div className="space-y-6">
      <h1 className="text-[22px]">Complementary Gifts / Services</h1>
      <form action="/api/admin/complementary" method="post" className="card p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field"><span className="label">Name</span><input name="name" required className="input"/></label>
          <label className="field"><span className="label">Type</span>
            <select name="type" className="input" value={type} onChange={e=>setType(e.target.value as any)}><option value="product">Product</option><option value="service">Service</option></select>
          </label>
        </div>
        <label className="field"><span className="label">Item</span>
          <select name="itemId" required className="input">
            <option value="">Select item</option>
            {items.map(i=> <option key={i.id} value={i.slug}>{i.name} ({i.slug})</option>)}
          </select>
        </label>
        {type === "product" && (
          <label className="field"><span className="label">Delivery Mode</span>
            <select name="deliveryMode" className="input" defaultValue="delivery">
              <option value="onsite">On site / Face to face</option>
              <option value="delivery">Delivery to address</option>
            </select>
          </label>
        )}
        <label className="field"><span className="label">Notes</span><textarea name="notes" className="textarea"/></label>
        <button className="btn btn-primary btn-sm">Add</button>
      </form>
      <div className="card p-4">
        <ul className="space-y-2">
          {gifts.map(g=>(
            <li key={g.id} className="border-b border-line py-2 text-[13px]">{g.name} - {g.type} - {g.itemId} {g.deliveryMode && `· ${g.deliveryMode}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
