import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Shipping & delivery" };

export default function ShippingPage() {
  return (
    <>
      <div className="container-gd pt-6">
        <Link
          href="/policies"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:text-brand-dark"
        >
          <ArrowLeft size={14} />
          All policies
        </Link>
      </div>
      <section className="section pt-4">
        <div className="container-gd max-w-3xl">
          <span className="eyebrow">Policy</span>
          <h1 className="mt-2">Shipping & delivery</h1>
          <div className="prose-gd mt-6 text-[13.5px] leading-relaxed">
            <h2 className="text-[17px]">Where we ship</h2>
            <p>We ship across India.</p>

            <h2 className="mt-6 text-[17px]">Processing time</h2>
            <p>
              Orders are packed by hand at our farm kitchen. We usually dispatch
              within 1–2 working days of receiving a confirmed, paid order.
              Weekends and public holidays are not counted as working days.
            </p>

            <h2 className="mt-6 text-[17px]">Delivery time</h2>
            <p>
              Most orders reach you in 3–7 working days depending on your location
              and courier serviceability.
            </p>

            <h2 className="mt-6 text-[17px]">Shipping charges</h2>
            <p>
              <strong>Free delivery</strong> on orders of{" "}
              <strong>₹{site.freeShippingAbove}</strong> and above. For orders
              below that, a flat shipping fee of{" "}
              <strong>₹{site.shippingFee}</strong> is applied at checkout.
            </p>

            <h2 className="mt-6 text-[17px]">Tracking</h2>
            <p>
              As soon as your order is dispatched, we will share a tracking link
              by email. You can also check the status from{" "}
              <Link href="/account" className="link-underline">
                My account
              </Link>
              .
            </p>

            <h2 className="mt-6 text-[17px]">Damaged in transit</h2>
            <p>
              If your order arrives damaged, photograph the box and contents and
              email <a href={`mailto:${site.email}`} className="link-underline">{site.email}</a>{" "}
              within 48 hours of delivery. We will replace or refund it.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
