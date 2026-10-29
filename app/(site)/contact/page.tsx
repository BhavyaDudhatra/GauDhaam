import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  MessageCircle,
} from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { getStore } from "@/lib/store";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about an order, bulk gifting or a farm visit? Write to the GauDhaam team.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service: serviceSlug } = await searchParams;

  let subject = "";
  if (serviceSlug) {
    const store = await getStore();
    const service = await store.services.getBySlug(serviceSlug);
    if (service) subject = `Enquiry: ${service.name}`;
  }

  return (
    <>
      <section className="border-b border-line bg-light/45">
        <div className="container-gd py-10 md:py-14">
          <span className="eyebrow">Say hello</span>
          <h1 className="mt-3">We would love to hear from you.</h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed">
            A question about an order, a bulk gift, a farm visit or simply how to
            use a product — write to us and a real person will reply.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-gd grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-banner border border-line">
              <Image
                src="/assets/images/conus.jpg"
                alt="The fields around the GauDhaam farm"
                fill
                sizes="(max-width: 1024px) 100vw, 460px"
                className="object-cover"
              />
            </div>

            <div className="card divide-y divide-line">
              <div className="flex gap-3 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-light text-brand">
                  <MapPin size={17} />
                </span>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wide text-brown">
                    Visit or write
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed">{site.address}</p>
                </div>
              </div>

              <div className="flex gap-3 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-light text-brand">
                  <Phone size={17} />
                </span>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wide text-brown">
                    Call us
                  </p>
                  <a
                    href={`tel:${site.phoneHref}`}
                    className="mt-1 block text-[12.5px] hover:text-brand"
                  >
                    {site.phone}
                  </a>
                </div>
              </div>

              <div className="flex gap-3 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-light text-brand">
                  <Mail size={17} />
                </span>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wide text-brown">
                    Email
                  </p>
                  <a
                    href={`mailto:${site.email}`}
                    className="mt-1 block break-all text-[12.5px] hover:text-brand"
                  >
                    {site.email}
                  </a>
                </div>
              </div>

              <div className="flex gap-3 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-light text-brand">
                  <Clock size={17} />
                </span>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wide text-brown">
                    Hours
                  </p>
                  <p className="mt-1 text-[12.5px]">{site.hours}</p>
                  <p className="text-[11.5px] text-body/70">
                    Farm visits by appointment only.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-card border border-line bg-white/60 p-4">
              <p className="flex items-center gap-2 text-[12.5px] font-semibold text-brand-dark">
                <MessageCircle size={15} className="text-brand" />
                Order help?
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-body/80">
                Keep your order number handy — it starts with <strong>GD-</strong>.
                You can also{" "}
                <Link href="/account" className="link-underline">
                  sign in
                </Link>{" "}
                to see your order status.
              </p>
            </div>
          </div>

          <div className="card p-5 md:p-7">
            <h2 className="text-[19px]">Send a message</h2>
            <p className="mt-1 text-[12.5px] text-body/80">
              We usually reply within one working day.
            </p>
            <div className="mt-5">
              <ContactForm defaultSubject={subject} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
