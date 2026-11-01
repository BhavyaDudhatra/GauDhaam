import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, Leaf, Package, ShieldCheck, Truck } from "lucide-react";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductCard } from "@/components/product/product-card";
import { SubscribeButton } from "@/components/product/subscribe-button";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { submitFeedbackAction } from "@/lib/actions/feedback";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore();
  const product = await store.products.getBySlug(slug);

  if (!product) return { title: "Product not found" };

  const image = product.images?.[0] ?? "/assets/images/Ghee.jpg";

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: image, width: 1200, height: 1200 }],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const store = await getStore();
  const product = await store.products.getBySlug(slug);

  if (!product || !product.available) notFound();

  const [all, session, feedbacks] = await Promise.all([
    store.products.list(),
    getSession(),
    store.feedback.list({ productId: product.id, approved: true }),
  ]);
  const user = session ? await store.users.get(session.id) : null;
  const userOrders = session ? await store.orders.list({ userId: session.id }) : [];
  const hasPurchasedDelivered = session
    ? userOrders.some(o => o.status === "delivered" && o.items?.some(i => i.productId === product.id))
    : false;
  const related = [
    ...all.filter(
      (item) => item.available && item.category === product.category && item.id !== product.id,
    ),
    ...all.filter(
      (item) => item.available && item.category !== product.category && item.id !== product.id,
    ),
  ].slice(0, 4);

  const image = product.images?.[0] ?? "/assets/images/Ghee.jpg";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.shortDescription,
    category: product.category,
    brand: { "@type": "Brand", name: "GauDhaam" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-gd pt-6">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-[11.5px] text-body/70"
        >
          <Link href="/" className="hover:text-brand">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-brand">
            Products
          </Link>
          <ChevronRight size={12} />
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-brand"
          >
            {product.category}
          </Link>
          <ChevronRight size={12} />
          <span className="truncate text-brand-dark">{product.name}</span>
        </nav>
      </div>

      <section className="section pt-5">
        <div className="container-gd grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-banner border border-line bg-light">
              <Image
                src={image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
              {product.featured && (
                <span className="badge absolute bottom-4 left-4 border border-line bg-cream/90 text-brand-dark backdrop-blur">
                  <Leaf size={11} />
                  Small batch
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-2xl border border-line"
                  >
                    <Image
                      src={src}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-brown">{product.category}</span>
            </div>

            <h1 className="mt-3 text-[25px] leading-tight md:text-[28px]">
              {product.name}
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed">
              {product.shortDescription}
            </p>

            <ProductDetail product={product} />

            <div className="mt-3">
              <SubscribeButton
                productId={product.id}
                productName={product.name}
                productSlug={product.slug}
                signedIn={Boolean(session)}
                defaultName={user?.name ?? session?.name ?? ""}
                defaultPhone={user?.phone ?? ""}
              />
            </div>

            <ul className="mt-6 grid gap-2.5 rounded-card border border-line bg-white/70 p-4 text-[12.5px] sm:grid-cols-3 sm:gap-3">
              <li className="flex items-center gap-2">
                <Truck size={16} className="shrink-0 text-brand" />
                <span>Free delivery over ₹999</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="shrink-0 text-brand" />
                <span>Secure Razorpay payment</span>
              </li>
              <li className="flex items-center gap-2">
                <Package size={16} className="shrink-0 text-brand" />
                <span>Dispatched in 1–2 days</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="container-gd mt-10 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="card p-5 md:p-7">
            <h2 className="text-[18px]">About this product</h2>
            <div className="prose-gd mt-3 text-[13.5px] leading-relaxed">
              {product.description.split(/\n\n+/).map((paragraph, index) => (
                <p key={index} className="mt-3 first:mt-0">
                  {paragraph}
                </p>
              ))}
            </div>

            {product.ingredients && (
              <div className="mt-6 rounded-2xl bg-light/70 p-4">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-brand-dark">
                  Ingredients
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-body">
                  {product.ingredients}
                </p>
              </div>
            )}

            {product.howToUse && (
              <div className="mt-4 rounded-2xl bg-light/70 p-4">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-brand-dark">
                  How to use
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-body">
                  {product.howToUse}
                </p>
              </div>
            )}
          </div>

          <div className="card p-5 md:p-7">
            <h2 className="text-[18px]">Highlights</h2>
            <ul className="mt-4 space-y-3">
              {product.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-2.5 text-[13px]"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-light text-brand">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-line pt-4 text-[12px] leading-relaxed text-body/80">
              <p>Store in a cool, dry place away from direct sunlight.</p>
              <p className="mt-2">
                Questions about this product?{" "}
                <Link href="/contact" className="link-underline">
                  Ask us
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {product.galleryImages && product.galleryImages.length > 0 && (
        <section className="section pt-10">
          <div className="container-gd">
            <h2 className="text-[18px] font-semibold">Gallery</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {product.galleryImages.map((src, idx) => (
                <div key={src + idx} className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-light">
                  <Image src={src} alt={`Gallery ${idx+1}`} fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section pt-10">
        <div className="container-gd">
          <h2 className="text-[18px] font-semibold">Reviews</h2>
          {session && hasPurchasedDelivered && (
            <form action={submitFeedbackAction} className="mt-4 card p-4 space-y-3">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="productName" value={product.name} />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="field">
                  <span className="label">Rating</span>
                  <select name="rating" required className="input">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} stars</option>)}
                  </select>
                </label>
                <label className="field">
                  <span className="label">Title</span>
                  <input name="title" required className="input" placeholder="Short headline" />
                </label>
              </div>
              <label className="field">
                <span className="label">Comment</span>
                <textarea name="comment" rows={3} required className="textarea" placeholder="Tell us about your experience" />
              </label>
              <button className="btn btn-primary btn-sm">Submit review</button>
            </form>
          )}
          {feedbacks.length === 0 ? (
            <p className="mt-4 text-[13px] text-body/70">No reviews yet. Be the first to share your experience.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {feedbacks.map(f => (
                <div key={f.id} className="card p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold">{f.userName}</span>
                    <span className="text-[11px] text-body/60">· {new Date(f.createdAt).toLocaleDateString()}</span>
                    <span className="ml-auto text-[12px]">{"★".repeat(f.rating)}{"☆".repeat(5-f.rating)}</span>
                  </div>
                  <p className="mt-1 text-[13px] font-semibold">{f.title}</p>
                  <p className="mt-1 text-[13px] text-body/80">{f.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section border-t border-line bg-white/45 pt-12">
          <div className="container-gd">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Goes well with</span>
                <h2 className="mt-2">You may also like</h2>
              </div>
              <Link href="/products" className="btn btn-outline btn-sm">
                View all
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3.5 md:gap-5 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
