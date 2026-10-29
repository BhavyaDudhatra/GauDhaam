import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Leaf } from "lucide-react";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description:
    "GauDhaam subscriptions, corporate gifting, Ayurvedic wellness consultations and farm visits.",
};

export default async function ServicesPage() {
  const store = await getStore();
  const services = await store.services.list();

  return (
    <>
      <section className="border-b border-line bg-light/45">
        <div className="container-gd py-10 md:py-14">
          <span className="eyebrow">
            <Leaf size={13} />
            More than a jar
          </span>
          <h1 className="mt-3 max-w-2xl">
            A little more care, in the way that suits you.
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed">
            Monthly subscriptions, thoughtful gifts for your team, a slow
            conversation about everyday health, or a morning at the farm. All run
            by the same small team.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-gd space-y-6">
          {services.map((service, index) => (
            <article
              key={service.id}
              className="grid overflow-hidden rounded-banner border border-line bg-white lg:grid-cols-2"
            >
              <div
                className={`relative min-h-[240px] lg:min-h-[340px] ${
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}
              >
                <Image
                  src={service.images?.[0] ?? "/assets/images/banner.jpg"}
                  alt={service.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 580px"
                  className="object-cover"
                />
                <span className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-cream/90 text-[12px] font-bold text-brand-dark backdrop-blur">
                  0{index + 1}
                </span>
              </div>

              <div className="p-6 md:p-8 lg:p-10">
                <span className="badge badge-green">{service.priceNote}</span>
                <h2 className="mt-3 text-[21px] md:text-[23px]">{service.name}</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-body">
                  {service.tagline}
                </p>

                <ul className="mt-4 space-y-2">
                  {(service.highlights ?? []).slice(0, 4).map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2.5 text-[12.5px] leading-relaxed"
                    >
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-light text-brand">
                        <Check size={10} strokeWidth={3} />
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/services/${service.slug}`}
                    className="btn btn-primary"
                  >
                    Learn more
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    href={`/contact?service=${service.slug}`}
                    className="btn btn-outline"
                  >
                    Enquire
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {services.length === 0 && (
            <div className="card px-6 py-14 text-center">
              <h2 className="text-[18px]">Services are being updated</h2>
              <p className="mt-2 text-[13px]">
                In the meantime, write to us and we will help you directly.
              </p>
              <Link href="/contact" className="btn btn-primary mt-5">
                Contact us
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
