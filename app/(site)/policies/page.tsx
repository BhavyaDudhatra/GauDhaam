import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Scale, Shield, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Policies",
  description: "Shipping, returns, privacy and terms for GauDhaam.",
};

const policies = [
  {
    title: "Shipping & delivery",
    href: "/policies/shipping",
    icon: Truck,
    text: "Delivery timelines, free shipping and tracking.",
  },
  {
    title: "Returns & refunds",
    href: "/policies/refund",
    icon: Scale,
    text: "When you can return, how refunds work.",
  },
  {
    title: "Privacy policy",
    href: "/policies/privacy",
    icon: Shield,
    text: "What we collect and how we use it.",
  },
  {
    title: "Terms of use",
    href: "/policies/terms",
    icon: FileText,
    text: "The rules for using our website and placing orders.",
  },
];

export default function PoliciesPage() {
  return (
    <>
      <section className="border-b border-line bg-light/45">
        <div className="container-gd py-9 md:py-11">
          <span className="eyebrow">Legal</span>
          <h1 className="mt-2">Policies</h1>
          <p className="mt-2 text-[13.5px]">
            Clear, simple rules — the same ones we would want as customers.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-gd grid gap-3 md:grid-cols-2">
          {policies.map((policy) => (
            <Link
              key={policy.href}
              href={policy.href}
              className="group flex items-center gap-4 rounded-card border border-line bg-white p-5 transition-shadow hover:shadow-soft"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-light text-brand">
                <policy.icon size={19} strokeWidth={1.7} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold text-brand-dark">
                  {policy.title}
                </p>
                <p className="mt-0.5 text-[12px] text-body/75">{policy.text}</p>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 text-brand transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
