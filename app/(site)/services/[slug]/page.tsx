import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Leaf } from "lucide-react";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore();
  const service = await store.services.getBySlug(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.name,
    description: service.tagline,
    openGraph: {
      title: service.name,
      description: service.tagline,
      images: [{ url: service.images?.[0] ?? "/assets/images/banner.jpg" }],
    },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const store = await getStore();
  const service = await store.services.getBySlug(slug);
  if (!service || !service.active) notFound();

  const others = (await store.services.list()).filter(
    (item) => item.id !== service.id,
  );

  return (
    <>
      <div className="container-gd pt-6">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:text-brand-dark"
        >
          <ArrowLeft size={14} />
          All services
        </Link>
      </div>

      <section className="section pt-4">
        <div className="container-gd grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div className="relative order-2 lg:order-1">
            <span className="eyebrow">
              <Leaf size={13} />
              Gaudham service
            </span>
            <h1 className="mt-3 text-[27px] leading-tight md:text-[30px]">
              {service.name}
            </h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-body">
              {service.tagline}
            </p>

            <span className="badge badge-brown mt-4">{service.priceNote}</span>

            <div className="prose-gd mt-5 text-[13.5px] leading-relaxed">
              {service.description.split(/\n\n+/).map((paragraph, index) => (
                <p key={index} className="mt-3 first:mt-0">
                  {paragraph}
                </p>
              ))}
            </div>

            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {(service.highlights ?? []).map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-2 rounded-xl border border-line bg-white/70 px-3 py-2.5 text-[12px] leading-relaxed"
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
                href={`/contact?service=${service.slug}`}
                className="btn btn-primary btn-lg"
              >
                Enquire about this
                <ArrowRight size={16} />
              </Link>
              <Link href="/shop" className="btn btn-outline btn-lg">
                Shop products
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-banner border border-line bg-light">
              <Image
                src={service.images?.[0] ?? "/assets/images/banner.jpg"}
                alt={service.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section border-t border-line bg-white/45 pt-10">
          <div className="container-gd">
            <h2 className="text-[19px]">Other ways we can help</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {others.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/services/${item.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-card border border-line bg-white p-4 transition-shadow hover:shadow-soft"
                >
                  <div>
                    <p className="text-[13.5px] font-semibold text-brand-dark">
                      {item.name}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[11.5px] text-body/75">
                      {item.priceNote}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-brand transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
