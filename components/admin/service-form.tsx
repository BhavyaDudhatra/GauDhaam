"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ImageManager } from "@/components/admin/image-manager";
import { saveServiceAction } from "@/lib/actions/admin";
import type { FormState } from "@/lib/actions/state";
import type { Service } from "@/lib/types";

export function ServiceForm({ service }: { service?: Service }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveServiceAction,
    null,
  );
  const [images, setImages] = useState<string[]>(
    service?.images?.length ? service.images : ["/assets/images/banner.jpg"],
  );

  return (
    <form action={formAction} className="space-y-5">
      {service && <input type="hidden" name="id" value={service.id} />}

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
