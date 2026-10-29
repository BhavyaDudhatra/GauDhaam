"use client";

import { useActionState } from "react";
import { addAddressAction, updateAddressAction, deleteAddressAction, setDefaultAddressAction } from "@/lib/actions/account";
import type { FormState } from "@/lib/actions/state";
import type { Address } from "@/lib/types";
import { useState } from "react";

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [addState, addAction, addPending] = useActionState<FormState, FormData>(addAddressAction, null);
  const [editState, editAction, editPending] = useActionState<FormState, FormData>(updateAddressAction, null);

  const [editing, setEditing] = useState<Address | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {addresses?.map(addr => (
          <div key={addr.id} className="rounded-card border border-line p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{addr.label}{addr.isDefault && " • Default"}</p>
                <p className="text-[12.5px] text-body/70">{addr.name}, {addr.phone}</p>
                <p className="text-[12.5px] text-body/70">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                <p className="text-[12.5px] text-body/70">{addr.city}, {addr.state} {addr.pincode}</p>
              </div>
              <div className="flex gap-2">
                <form action={setDefaultAddressAction}>
                  <input type="hidden" name="id" value={addr.id} />
                  <button type="submit" className="text-[11px] underline">Set default</button>
                </form>
                <button onClick={() => setEditing(addr)} className="text-[11px] underline">Edit</button>
                <form action={deleteAddressAction}>
                  <input type="hidden" name="id" value={addr.id} />
                  <button type="submit" className="text-[11px] underline text-red-600">Delete</button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {(!addresses || addresses.length === 0) && (
          <p className="text-[12.5px] text-body/70">No addresses saved yet.</p>
        )}
      </div>

      <form action={addAction} className="grid gap-3 sm:grid-cols-2 rounded-card border border-line p-4">
        <h3 className="sm:col-span-2 text-[14px] font-semibold">Add new address</h3>
        <input name="label" placeholder="Label e.g. Home" required className="input" />
        <input name="name" placeholder="Full name" required className="input" />
        <input name="phone" placeholder="Phone" required className="input sm:col-span-2" />
        <input name="line1" placeholder="Address line 1" required className="input sm:col-span-2" />
        <input name="line2" placeholder="Address line 2" className="input sm:col-span-2" />
        <input name="city" placeholder="City" required className="input" />
        <input name="state" placeholder="State" required className="input" />
        <input name="pincode" placeholder="Pincode" required className="input" />
        <label className="flex items-center gap-2 text-[12px] sm:col-span-2">
          <input type="checkbox" name="isDefault" /> Set as default
        </label>
        <button disabled={addPending} className="btn btn-primary sm:col-span-2">Add address</button>
        {addState?.error && <p className="text-red-600 text-[12px] sm:col-span-2">{addState.error}</p>}
        {addState?.success && <p className="text-green-700 text-[12px] sm:col-span-2">{addState.success}</p>}
      </form>

      {editing && (
        <form action={editAction} className="rounded-card border border-line p-4">
          <h3 className="text-[14px] font-semibold mb-3">Edit address</h3>
          <input type="hidden" name="id" value={editing.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="label" defaultValue={editing.label} className="input" />
            <input name="name" defaultValue={editing.name} className="input" />
            <input name="phone" defaultValue={editing.phone} className="input sm:col-span-2" />
            <input name="line1" defaultValue={editing.line1} className="input sm:col-span-2" />
            <input name="line2" defaultValue={editing.line2 || ""} className="input sm:col-span-2" />
            <input name="city" defaultValue={editing.city} className="input" />
            <input name="state" defaultValue={editing.state} className="input" />
            <input name="pincode" defaultValue={editing.pincode} className="input" />
            <label className="flex items-center gap-2 text-[12px] sm:col-span-2">
              <input type="checkbox" name="isDefault" defaultChecked={editing.isDefault} /> Set as default
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="btn btn-primary">Save</button>
            <button type="button" onClick={() => setEditing(null)} className="btn btn-outline">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
