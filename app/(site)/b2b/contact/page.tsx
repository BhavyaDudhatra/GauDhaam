import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "B2B Contact – GauDhaam",
  description: "Bulk orders, corporate gifting and reseller enquiries for GauDhaam.",
};

export default function B2BContactPage() {
  return (
    <div className="container-gd py-10">
      <Link href="/b2b" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand hover:text-brand-dark">
        <ArrowLeft size={14} />
        Back to B2B
      </Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h1 className="text-[28px] font-bold">B2B & Bulk Enquiries</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-body/80">
            We work with restaurants, hotels, corporate offices, wellness studios and resellers.
            Get custom pricing, scheduled deliveries and dedicated account support.
          </p>
          <div className="mt-6 space-y-3 text-[13.5px]">
            <p><strong>Email:</strong> <a href={`mailto:${site.email}`} className="link-underline">{site.email}</a></p>
            <p><strong>Phone / WhatsApp:</strong> <a href={`tel:${site.phoneHref}`} className="link-underline">{site.phone}</a></p>
            <p><strong>Hours:</strong> {site.hours}</p>
          </div>
        </div>
        <form className="rounded-card border border-line p-6 space-y-3">
          <h2 className="text-[18px] font-semibold">Request a quote</h2>
          <input name="name" placeholder="Your name" required className="input" />
          <input name="company" placeholder="Company name" required className="input" />
          <input name="email" type="email" placeholder="Work email" required className="input" />
          <input name="phone" placeholder="Phone" required className="input" />
          <textarea name="message" placeholder="What products and quantities are you interested in?" rows={5} className="input" />
          <button className="btn btn-primary btn-block">Send enquiry</button>
          <p className="text-[11px] text-body/60">We usually reply within 1 business day.</p>
        </form>
      </div>
    </div>
  );
}
