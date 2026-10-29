import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
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
          <h1 className="mt-2">Privacy policy</h1>
          <p className="mt-2 text-[12px] text-body/70">Last updated: October 2026</p>
          <div className="prose-gd mt-6 text-[13.5px] leading-relaxed">
            <p>
              At <strong>{site.name}</strong>, we respect your privacy and only
              collect the information needed to run our store, fulfil orders and
              reply to messages.
            </p>

            <h2 className="mt-6 text-[17px]">Information we collect</h2>
            <ul>
              <li>
                <strong>Account details:</strong> name, email and phone number if
                you create an account.
              </li>
              <li>
                <strong>Order details:</strong> delivery address, items bought,
                payment status (we never store card numbers).
              </li>
              <li>
                <strong>Messages:</strong> details you share via the contact form.
              </li>
              <li>
                <strong>Technical:</strong> basic logs needed to keep the site
                secure.
              </li>
            </ul>

            <h2 className="mt-6 text-[17px]">How we use it</h2>
            <ul>
              <li>To process and deliver your orders</li>
              <li>To send order updates and tracking information</li>
              <li>To reply to your questions and support requests</li>
              <li>To keep the website safe and prevent fraud</li>
            </ul>

            <h2 className="mt-6 text-[17px]">Payments</h2>
            <p>
              Payments are processed securely by{" "}
              <strong>Razorpay</strong>. We only receive confirmation of payment
              and the order details Razorpay shares for fulfilment.
            </p>

            <h2 className="mt-6 text-[17px]">Data sharing</h2>
            <p>
              We only share information with couriers needed to deliver your
              order, and with Razorpay to process payments. We do not sell your
              data.
            </p>

            <h2 className="mt-6 text-[17px]">Cookies</h2>
            <p>
              We use a single essential session cookie to keep you signed in. No
              third-party advertising cookies.
            </p>

            <h2 className="mt-6 text-[17px]">Contact</h2>
            <p>
              Questions about privacy? Email{" "}
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
