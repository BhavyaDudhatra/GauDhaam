import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Returns & refunds" };

export default function RefundPage() {
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
          <h1 className="mt-2">Returns & refunds</h1>
          <div className="prose-gd mt-6 text-[13.5px] leading-relaxed">
            <h2 className="text-[17px]">Returns</h2>
            <p>
              Because our products are food, herbal care and handmade goods, we
              can only accept returns of <strong>unopened</strong> products in
              their original, undamaged packaging.
            </p>
            <p>
              Requests must be made within{" "}
              <strong>{site.returnsWindow} days</strong> of delivery by emailing{" "}
              <a href={`mailto:${site.email}`} className="link-underline">
                {site.email}
              </a>{" "}
              with your order number and photos if relevant.
            </p>

            <h2 className="mt-6 text-[17px]">Damaged or incorrect items</h2>
            <p>
              If you receive a damaged item or the wrong product, please contact
              us within 48 hours of delivery with photos of the package and
              contents. We will send a replacement or issue a full refund at no
              extra cost.
            </p>

            <h2 className="mt-6 text-[17px]">Refunds</h2>
            <p>
              Once we have received and inspected the returned item (where
              applicable), we will notify you. Approved refunds are credited to
              the original payment method within 7–10 working days.
            </p>

            <h2 className="mt-6 text-[17px]">Non-returnable</h2>
            <ul>
              <li>Opened or used products</li>
              <li>Items bought on sale or as part of a custom gift order</li>
              <li>Products damaged due to improper storage after delivery</li>
            </ul>

            <h2 className="mt-6 text-[17px]">Cancellations</h2>
            <p>
              Orders can be cancelled before they are dispatched. Once
              dispatched, they cannot be cancelled and fall under the return
              policy above.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
