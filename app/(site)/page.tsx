import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gaudham | Pure Organic Products",
  description:
    "Cold-pressed oils, A2 ghee, raw honey, herbal powders and handmade soaps from Gaudham.",
};

export default async function HomePage() {
  const store = await getStore();
  const [products, services] = await Promise.all([
    store.products.list(),
    store.services.list(),
  ]);

  const featured = products
    .filter((product) => product.featured && product.available)
    .slice(0, 4);
  const picks = (featured.length ? featured : products.filter((p) => p.available)).slice(
    0,
    8,
  );

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/banner.jpg"
            alt="Gaudham organic farm"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/95 to-cream/40" />
        </div>
        <div className="container-gd relative py-12 md:py-16 lg:py-20">
          <span className="eyebrow">
            <Leaf size={13} />
            Farm to your home
          </span>
          <h1 className="mt-3 max-w-2xl">
            Honest, small-batch organic products rooted in care.
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed">
            Cold-pressed oils, A2 ghee, raw honey, herbal powders and handmade
            soaps crafted slowly with traditional methods.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/products" className="btn btn-primary">
              Shop products
              <ArrowRight size={15} />
            </Link>
            <Link href="/services" className="btn btn-outline">
              Our services
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex items-center gap-2.5 rounded-2xl border border-line bg-white/80 px-3.5 py-2.5 text-[12.5px] backdrop-blur">
              <Truck size={16} className="text-brand" />
              Free delivery over ₹999
            </li>
            <li className="flex items-center gap-2.5 rounded-2xl border border-line bg-white/80 px-3.5 py-2.5 text-[12.5px] backdrop-blur">
              <ShieldCheck size={16} className="text-brand" />
              Secure Razorpay payment
            </li>
            <li className="flex items-center gap-2.5 rounded-2xl border border-line bg-white/80 px-3.5 py-2.5 text-[12.5px] backdrop-blur">
              <Sparkles size={16} className="text-brand" />
              Small-batch & pure
            </li>
            <li className="flex items-center gap-2.5 rounded-2xl border border-line bg-white/80 px-3.5 py-2.5 text-[12.5px] backdrop-blur">
              <Leaf size={16} className="text-brand" />
              Traditionally made
            </li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container-gd">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Handpicked</span>
              <h2 className="mt-2">Best sellers</h2>
            </div>
            <Link href="/products" className="btn btn-outline btn-sm">
              View all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3.5 md:gap-5 lg:grid-cols-4">
            {picks.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section className="section border-t border-line bg-white/50">
          <div className="container-gd">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Gaudham services</span>
                <h2 className="mt-2">More ways to care</h2>
              </div>
              <Link href="/services" className="btn btn-outline btn-sm">
                All services
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {services.slice(0, 2).map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="card group overflow-hidden"
                >
                  <div className="relative h-48">
                    <Image
                      src={service.images[0] ?? "/assets/images/banner.jpg"}
                      alt={service.name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-[17px]">{service.name}</h3>
                    <p className="mt-1 text-[13px] text-body/80">
                      {service.tagline}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container-gd">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-5">
              <h3 className="text-[16px]">Pure by process</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed">
                Cold-pressed, slow-made and checked in small batches without
                unnecessary additives.
              </p>
            </div>
            <div className="card p-5">
              <h3 className="text-[16px]">Honest labels</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed">
                Clear ingredients, real weights and fair pricing with no hidden
                claims.
              </p>
            </div>
            <div className="card p-5">
              <h3 className="text-[16px]">Rooted in tradition</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed">
                Time-tested ways, adapted for everyday use with care for the
                land.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
