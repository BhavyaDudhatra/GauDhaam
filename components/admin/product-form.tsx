"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ImageManager } from "@/components/admin/image-manager";
import { saveProductAction } from "@/lib/actions/admin";
import type { FormState } from "@/lib/actions/state";
import type { Product, ProductVariant } from "@/lib/types";

type VariantDraft = Omit<ProductVariant, "offer"> & {
  offer: { type: "none" | "percentage" | "fixed"; value: string; label: string };
};

function toDrafts(product?: Product): VariantDraft[] {
  if (!product?.variants?.length) {
    return [
      {
        id: `variant-${Date.now()}`,
        label: "",
        price: 0,
        mrp: null,
        stock: 0,
        sku: "",
        active: true,
        offer: { type: "none", value: "", label: "" },
      },
    ];
  }
  return product.variants.map((variant) => ({
    ...variant,
    sku: variant.sku ?? "",
    offer: variant.offer
      ? {
          type: variant.offer.type,
          value: String(variant.offer.value),
          label: variant.offer.label ?? "",
        }
      : { type: "none", value: "", label: "" },
  }));
}

function serialise(drafts: VariantDraft[]) {
  return JSON.stringify(
    drafts.map((draft, index) => ({
      id: draft.id || `variant-${index + 1}-${Date.now()}`,
      label: draft.label,
      price: draft.price,
      mrp: draft.mrp,
      stock: draft.stock,
      sku: draft.sku,
      active: draft.active,
      offer:
        draft.offer.type === "none" || !Number(draft.offer.value)
          ? null
          : {
              type: draft.offer.type,
              value: Number(draft.offer.value),
              ...(draft.offer.label ? { label: draft.offer.label } : {}),
            },
    })),
  );
}

export function ProductForm({ product }: { product?: Product }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveProductAction,
    null,
  );
  const [images, setImages] = useState<string[]>(
    product?.images?.length ? product.images : ["/assets/images/Ghee.jpg"],
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    product?.galleryImages?.length ? product.galleryImages : [],
  );
  const [variants, setVariants] = useState<VariantDraft[]>(() => toDrafts(product));

  function patchVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function patchOffer(index: number, patch: Partial<VariantDraft["offer"]>) {
    setVariants((current) =>
      current.map((item, i) =>
        i === index ? { ...item, offer: { ...item.offer, ...patch } } : item,
      ),
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="variants" value={serialise(variants)} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="galleryImages" value={JSON.stringify(galleryImages)} />

      <div className="card p-5">
        <h2 className="text-[16px]">Basics</h2>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <label className="field">
            <span className="label">Product name</span>
            <input
              name="name"
              required
              defaultValue={product?.name}
              className="input"
              placeholder="A2 Bilona Cow Ghee"
            />
          </label>
          <label className="field">
            <span className="label">URL slug (optional)</span>
            <input
              name="slug"
              defaultValue={product?.slug}
              className="input"
              placeholder="a2-bilona-cow-ghee"
            />
          </label>
          <label className="field">
            <span className="label">Category</span>
            <input
              name="category"
              required
              defaultValue={product?.category}
              className="input"
              placeholder="Ghee"
              list="product-categories"
            />
            <datalist id="product-categories">
              <option value="Ghee" />
              <option value="Herbal" />
              <option value="Honey" />
              <option value="Soap" />
            </datalist>
          </label>
          <div className="flex flex-wrap items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-[13px] font-semibold text-brand-dark">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product?.featured ?? false}
                className="h-4 w-4 rounded border-line"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-[13px] font-semibold text-brand-dark">
              <input
                type="checkbox"
                name="available"
                defaultChecked={product?.available ?? true}
                className="h-4 w-4 rounded border-line"
              />
              Visible in store
            </label>
          </div>
          <label className="field sm:col-span-2">
            <span className="label">Short description (shown on cards)</span>
            <input
              name="shortDescription"
              required
              defaultValue={product?.shortDescription}
              className="input"
              maxLength={300}
            />
          </label>
          <label className="field sm:col-span-2">
            <span className="label">Full description</span>
            <textarea
              name="description"
              rows={6}
              defaultValue={product?.description}
              className="textarea"
            />
          </label>
          <label className="field sm:col-span-2">
            <span className="label">Highlights (one per line)</span>
            <textarea
              name="highlights"
              rows={4}
              defaultValue={product?.highlights?.join("\n")}
              className="textarea"
            />
          </label>
          <label className="field">
            <span className="label">Ingredients (optional)</span>
            <textarea
              name="ingredients"
              rows={3}
              defaultValue={product?.ingredients}
              className="textarea"
            />
          </label>
          <label className="field">
            <span className="label">How to use (optional)</span>
            <textarea
              name="howToUse"
              rows={3}
              defaultValue={product?.howToUse}
              className="textarea"
            />
          </label>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px]">Images</h2>
            <p className="mt-0.5 text-[12px] text-body/75">
              Uploaded to Google Drive — only the link is stored in Firestore.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <ImageManager value={images} onChange={setImages} />
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px]">Gallery / Reference images</h2>
            <p className="mt-0.5 text-[12px] text-body/75">
              Additional images shown on product page for reference.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <ImageManager value={galleryImages} onChange={setGalleryImages} />
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px]">Sizes / pack options</h2>
            <p className="mt-0.5 text-[12px] text-body/75">
              Each option has its own price, MRP and stock. Sold-out options stay visible.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setVariants((current) => [
                ...current,
                {
                  id: `variant-${Date.now()}`,
                  label: "",
                  price: 0,
                  mrp: null,
                  stock: 0,
                  sku: "",
                  active: true,
                  offer: { type: "none", value: "", label: "" },
                },
              ])
            }
            className="btn btn-outline btn-sm"
          >
            <Plus size={15} />
            Add option
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className="rounded-xl border border-line bg-cream/40 p-3.5"
            >
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-12">
                <label className="field lg:col-span-3">
                  <span className="label">Label</span>
                  <input
                    value={variant.label}
                    onChange={(event) => patchVariant(index, { label: event.target.value })}
                    className="input"
                    placeholder="500 g / 1 kg"
                    required
                  />
                </label>
                <label className="field lg:col-span-2">
                  <span className="label">Price ₹</span>
                  <input
                    type="number"
                    min={0}
                    value={variant.price}
                    onChange={(event) =>
                      patchVariant(index, { price: Number(event.target.value) })
                    }
                    className="input"
                    required
                  />
                </label>
                <label className="field lg:col-span-2">
                  <span className="label">MRP ₹</span>
                  <input
                    type="number"
                    min={0}
                    value={variant.mrp ?? ""}
                    onChange={(event) =>
                      patchVariant(index, {
                        mrp: event.target.value === "" ? null : Number(event.target.value),
                      })
                    }
                    className="input"
                    placeholder="Optional"
                  />
                </label>
                <label className="field lg:col-span-2">
                  <span className="label">Stock</span>
                  <input
                    type="number"
                    min={0}
                    value={variant.stock}
                    onChange={(event) =>
                      patchVariant(index, { stock: Number(event.target.value) })
                    }
                    className="input"
                    required
                  />
                </label>
                <label className="field lg:col-span-3">
                  <span className="label">SKU (optional)</span>
                  <input
                    value={variant.sku}
                    onChange={(event) => patchVariant(index, { sku: event.target.value })}
                    className="input"
                  />
                </label>
              </div>

              <div className="mt-2.5 flex flex-wrap items-end gap-2.5">
                <label className="flex items-center gap-2 text-[12.5px] font-semibold text-brand-dark">
                  <input
                    type="checkbox"
                    checked={variant.active}
                    onChange={(event) =>
                      patchVariant(index, { active: event.target.checked })
                    }
                    className="h-4 w-4 rounded border-line"
                  />
                  Active
                </label>

                <label className="field max-w-[150px]">
                  <span className="label">Offer</span>
                  <select
                    value={variant.offer.type}
                    onChange={(event) =>
                      patchOffer(index, {
                        type: event.target.value as VariantDraft["offer"]["type"],
                      })
                    }
                    className="select"
                  >
                    <option value="none">No offer</option>
                    <option value="percentage">% off</option>
                    <option value="fixed">₹ off</option>
                  </select>
                </label>
                {variant.offer.type !== "none" && (
                  <>
                    <label className="field max-w-[110px]">
                      <span className="label">Value</span>
                      <input
                        type="number"
                        min={0}
                        value={variant.offer.value}
                        onChange={(event) => patchOffer(index, { value: event.target.value })}
                        className="input"
                      />
                    </label>
                    <label className="field max-w-[200px] flex-1">
                      <span className="label">Offer label</span>
                      <input
                        value={variant.offer.label}
                        onChange={(event) => patchOffer(index, { label: event.target.value })}
                        className="input"
                        placeholder="e.g. Save 10%"
                      />
                    </label>
                  </>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setVariants((current) => current.filter((_, i) => i !== index))
                  }
                  disabled={variants.length <= 1}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[12px] font-semibold text-brown hover:bg-light disabled:opacity-40"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-[16px]">Product offer</h2>
        <p className="mt-0.5 text-[12px] text-body/75">
          Applies to every option unless that option has its own offer.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="field">
            <span className="label">Type</span>
            <select
              name="offerType"
              defaultValue={product?.offer?.type ?? ""}
              className="select"
            >
              <option value="">No offer</option>
              <option value="percentage">% off</option>
              <option value="fixed">₹ off</option>
            </select>
          </label>
          <label className="field">
            <span className="label">Value</span>
            <input
              name="offerValue"
              type="number"
              min={0}
              defaultValue={product?.offer?.value ?? ""}
              className="input"
            />
          </label>
          <label className="field">
            <span className="label">Starts (optional)</span>
            <input
              name="offerStart"
              type="date"
              defaultValue={product?.offer?.startDate ?? ""}
              className="input"
            />
          </label>
          <label className="field">
            <span className="label">Ends (optional)</span>
            <input
              name="offerEnd"
              type="date"
              defaultValue={product?.offer?.endDate ?? ""}
              className="input"
            />
          </label>
          <label className="field">
            <span className="label">Label</span>
            <input
              name="offerLabel"
              defaultValue={product?.offer?.label ?? ""}
              className="input"
              placeholder="Festive offer"
            />
          </label>
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
          {product ? "Save changes" : "Create product"}
        </button>
        <Link href="/admin/products" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
