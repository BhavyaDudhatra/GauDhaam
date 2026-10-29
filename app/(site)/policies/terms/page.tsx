import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
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
          <h1 className="mt-2">Terms of use</h1>
          <p className="mt-2 text-[12px] text-body/70">Last updated: October 2026</p>
          <div className="prose-gd mt-6 text-[13.5px] leading-relaxed">
            <p>
              By using <strong>{site.name}</strong> (&quot;we&quot;,
              &quot;our&quot;, &quot;the site&quot;) you agree to these terms.
            </p>

            <h2 className="mt-6 text-[17px]">Use of the site</h2>
            <p>
              You may browse the site for personal use. Do not misuse it, scrape
              data, or interfere with its operation.
            </p>

            <h2 className="mt-6 text-[17px]">Products and pricing</h2>
            <p>
              Prices are shown in Indian Rupees (INR). We try to keep them
              accurate, but reserve the right to correct errors. Product images
              are representative — handmade items may vary slightly.
            </p>

            <h2 className="mt-6 text-[17px]">Orders</h2>
            <p>
              Placing an order is an offer to buy. We may accept or decline it.
              Your order is only confirmed once payment is successful or we have
              confirmed it by email.
            </p>

            <h2 className="mt-6 text-[17px]">Payments</h2>
            <p>
              All online payments are processed through{" "}
              <strong>Razorpay</strong>. By paying, you agree to Razorpay&apos;s
              terms.
            </p>

            <h2 className="mt-6 text-[17px]">Intellectual property</h2>
            <p>
              All content on this site — text, images, logo and design — belongs
              to GauDhaam and cannot be used without permission.
            </p>

            <h2 className="mt-6 text-[17px]">Limitation of liability</h2>
            <p>
              We do our best to keep the site accurate and available, but we are
              not liable for indirect losses arising from its use or from
              delivery delays outside our control.
            </p>

            <h2 className="mt-6 text-[17px]">Governing law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes will be
              handled in the courts of Indore, Madhya Pradesh.
            </p>

            <h2 className="mt-6 text-[17px]">Contact</h2>
            <p>
              Questions about these terms? Email{" "}
              <a href={`mailto:${site.email}`} className="link-underline">
                {site.email}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
