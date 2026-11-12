"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ImageManager } from "@/components/admin/image-manager";
import { saveServiceAction } from "@/lib/actions/admin";
import type { FormState } from "@/lib/actions/state";
import type { Service, ComplimentaryItem, Product } from "@/lib/types";

export function ServiceForm({ service, products = [] }: { service?: Service; products?: Product[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveServiceAction,
    null,
  );
  const [images, setImages] = useState<string[]>(
    service?.images?.length ? service.images : ["/assets/images/banner.jpg"],
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    service?.galleryImages?.length ? service.galleryImages : [],
  );
  const [complimentaryItems, setComplimentaryItems] = useState<ComplimentaryItem[]>(
    service?.complimentaryItems ?? [],
  );

  return (
    <form action={formAction} className="space-y-5">
      {service && <input type="hidden" name="id" value={service.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="galleryImages" value={JSON.stringify(galleryImages)} />
      <input type="hidden" name="complimentaryItems" value={JSON.stringify(complimentaryItems)} />

      <div className="card p-5">
        <h2 className="text-[16px]">Service details</h2>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <label className="field">
            <span className="label">Service name</span>
            <input
              name="name"
              required
              defaultValue={service?.name}
              className="input"
              placeholder="Monthly ghee subscription"
            />
          </label>
          <label className="field">
            <span className="label">URL slug (optional)</span>
            <input
              name="slug"
              defaultValue={service?.slug}
              className="input"
              placeholder="monthly-ghee-subscription"
            />
          </label>
          <label className="field sm:col-span-2">
            <span className="label">Tagline</span>
            <input
              name="tagline"
              required
              defaultValue={service?.tagline}
              className="input"
              maxLength={240}
            />
          </label>
          <label className="field">
            <span className="label">Price note</span>
            <input
              name="priceNote"
              defaultValue={service?.priceNote}
              className="input"
              placeholder="From ₹1,499 / month"
            />
          </label>
          <div className="flex items-end gap-4 pb-1">
            <label className="field max-w-[110px]">
              <span className="label">Sort order</span>
              <input
                name="sort"
                type="number"
                min={0}
                defaultValue={service?.sort ?? 99}
                className="input"
              />
            </label>
            <label className="flex items-center gap-2 pb-3 text-[13px] font-semibold text-brand-dark">
              <input
                type="checkbox"
                name="active"
                defaultChecked={service?.active ?? true}
                className="h-4 w-4 rounded border-line"
              />
              Visible
            </label>
          </div>
          <label className="field sm:col-span-2">
            <span className="label">Description</span>
            <textarea
              name="description"
              rows={6}
              defaultValue={service?.description}
              className="textarea"
            />
          </label>
          <label className="field sm:col-span-2">
            <span className="label">Highlights (one per line)</span>
            <textarea
              name="highlights"
              rows={4}
              defaultValue={service?.highlights?.join("\n")}
              className="textarea"
            />
          </label>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-[16px]">Images</h2>
        <div className="mt-4">
          <ImageManager value={images} onChange={setImages} />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-[16px]">Gallery / Reference images</h2>
        <div className="mt-4">
          <ImageManager value={galleryImages} onChange={setGalleryImages} />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-[16px]">Complimentary items</h2>
        <p className="mt-1 text-[12.5px] text-body/70">
          Select products from the catalog to include as complimentary items with this service.
        </p>
        <div className="mt-4 max-h-80 overflow-y-auto border border-line rounded-lg">
          <table className="w-full text-[12.5px]">
            <thead className="border-b border-line bg-cream/60">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Product</th>
                <th className="px-3 py-2 text-right font-semibold">Include</th>
                <th className="px-3 py-2 text-right font-semibold">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {complimentaryItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-body/70">
                    No complimentary items added yet.
                  </td>
                </tr>
              )}
              {complimentaryItems.map((item) => (
                <tr key={item.productId} className="group">
                  <td className="px-3 py-3 text-body">{item.name}</td>
                  <td className="px-3 py-3 text-right">
                    <label className="flex items-center justify-end gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="complimentaryProductIds"
                        value={item.productId}
                        defaultChecked
                        onChange={(e) => {
                          if (e.target.checked) {
                            setComplimentaryItems((prev) =>
                              prev.some((i) => i.productId === item.productId)
                                ? prev
                                : [...prev, { productId: item.productId, name: item.name, quantity: 1 }],
                            );
                          } else {
                            setComplimentaryItems((prev) =>
                              prev.filter((i) => i.productId !== item.productId),
                            );
                          }
                        }}
                        className="h-4 w-4 rounded border-line accent-brand"
                      />
                      <span className="text-[11px] text-body">Include</span>
                    </label>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <input
                      type="number"
                      name={`complimentaryQty-${item.productId}`}
                      min="1"
                      defaultValue={item.quantity}
                      className="input input-sm w-16 text-right"
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value) || 1);
                        setComplimentaryItems((prev) =>
                          prev.map((i) =>
                            i.productId === item.productId
                              ? { ...i, quantity: val }
                              : i,
                          ),
                        );
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="field">
            <span className="label">Add product</span>
            <select
              name="newComplimentaryProductId"
              className="select"
              onChange={(e) => {
                const productId = e.target.value;
                if (!productId) return;
                const product = products.find((p) => p.id === productId);
                if (product && !complimentaryItems.some((i) => i.productId === productId)) {
                  setComplimentaryItems([...complimentaryItems, { productId: product.id, name: product.name, quantity: 1 }]);
                }
                e.target.value = "";
              }}
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!complimentaryItems.length}
            className="btn btn-outline btn-sm"
            onClick={() => setComplimentaryItems([])}
          >
            Clear all
          </button>
        </div>
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-card border border-[#E7CCC3] bg-[#F9EEE9] p-3.5 text-[12.5px] text-[#8A3E2C]"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending && <Loader2 size={16} className="animate-spin" />}
          {service ? "Save changes" : "Create service"}
        </button>
        <Link href="/admin/services" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
