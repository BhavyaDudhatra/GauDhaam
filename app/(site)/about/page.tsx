import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Droplets,
  Leaf,
  Package,
  Sprout,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "GauDhaam is a small farm-run kitchen making ghee, honey, herbal care and soap in batches small enough to taste the difference.",
};

const values = [
  {
    icon: Sprout,
    title: "Soil before shelf",
    text: "We buy from farmers and beekeepers we know, pay them fairly, and plan our batches around what the season actually gives us.",
  },
  {
    icon: Droplets,
    title: "Small batches, always",
    text: "A batch we can taste, date and stand behind. If we cannot make it well at scale, we would rather make less of it.",
  },
  {
    icon: Package,
    title: "Glass, not plastic",
    text: "Jars, bottles and paper tape. No shrink wrap, no polystyrene, no plastic scoop tucked inside the box.",
  },
];

const milestones = [
  {
    n: "01",
    title: "It began with ghee",
    text: "A family recipe, a small herd of cows and a stubborn dislike for ghee that tasted of nothing. We started culturing and churning at home, one kilo at a time.",
  },
  {
    n: "02",
    title: "The herbal shelf grew",
    text: "Friends asked for hair oil. Then a stone-ground powder. Then soap, because the herbs were already on the table. Each one was made slowly, and only when we were happy with it.",
  },
  {
    n: "03",
    title: "A shop of our own",
    text: "Word travelled through WhatsApp groups and Sunday markets. This website is simply that same small shop, open a little wider.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-light/40">
        <div className="container-gd grid items-center gap-8 py-10 md:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div>
            <span className="eyebrow">
              <Leaf size={13} />
              Our story
            </span>
            <h1 className="mt-3 max-w-xl text-[30px] leading-[1.18] md:text-[33px]">
              A small farm, a slow kitchen, and a stubborn belief in doing less.
            </h1>
            <p className="mt-4 max-w-lg text-[14px] leading-relaxed">
              GauDhaam makes ghee, honey, herbal care and soap the way a household
              would — in quantities we can see, smell and taste. No factory floor,
              no flavour lab, no shortcuts hidden behind a label.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-primary">
                Shop the pantry
                <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Come say hello
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-banner border border-line bg-white">
              <Image
                src="/assets/images/aboutus.jpg"
                alt="Fields and a farmhouse at the GauDhaam farm"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-4 rounded-card border border-line bg-cream/95 px-4 py-3 shadow-soft backdrop-blur sm:left-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brown">
                GauDhaam
              </p>
              <p className="mt-1 text-[12.5px] font-semibold text-brand-dark">
                Farm-run. Family-run.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facts */}
      <section className="border-b border-line bg-white/55">
        <div className="container-gd grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
          {[
            { value: "1", label: "farm kitchen" },
            { value: "2", label: "day dispatch" },
            { value: "3–7", label: "day delivery" },
            { value: "0", label: "preservatives" },
          ].map((fact) => (
            <div key={fact.label} className="text-center">
              <p className="text-[22px] font-bold text-brand-dark">{fact.value}</p>
              <p className="text-[11px] uppercase tracking-wide text-body/70">
                {fact.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="section">
        <div className="container-gd grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div>
            <span className="eyebrow">Why we started</span>
            <h2 className="mt-2">Because we could not find what we wanted to eat.</h2>
          </div>
          <div className="prose-gd text-[14px] leading-relaxed">
            <p>
              Somewhere between the big brands and the beautifully photographed
              jars, it became hard to know what was actually inside. Ghee that
              smelled of nothing. Honey that was mostly syrup. Hair oil that listed
              fragrance before herbs.
            </p>
            <p>
              So we made our own, for our family first. We cultured the cream
              overnight, churned it by hand and simmered it slowly. We bought honey
              from beekeepers who harvest wild combs and never heat it. We
              steeped herbs in cold-pressed oil and waited.
            </p>
            <p>
              Friends asked for a jar. Then another. GauDhaam grew from those
              requests — quietly, and only as fast as we could keep the quality
              where we wanted it.
            </p>
            <p className="font-semibold text-brand-dark">
              We still make everything in the same kitchen. The only difference is
              that the table is a little longer now.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section border-y border-line bg-white/55">
        <div className="container-gd">
          <div className="max-w-xl">
            <span className="eyebrow">What we hold on to</span>
            <h2 className="mt-2">Three things we will not compromise</h2>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-card border border-line bg-white p-6">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-light text-brand">
                  <value.icon size={20} strokeWidth={1.7} />
                </span>
                <h3 className="mt-4 text-[16px]">{value.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="section">
        <div className="container-gd grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <span className="eyebrow">How we got here</span>
            <h2 className="mt-2">Slowly, and in the right order</h2>
            <div className="relative mt-6 hidden aspect-[4/5] overflow-hidden rounded-banner border border-line lg:block">
              <Image
                src="/assets/images/gheehome.jpg"
                alt="A jar of ghee and a wooden spoon"
                fill
                sizes="380px"
                className="object-cover"
              />
            </div>
          </div>

          <ol className="space-y-4">
            {milestones.map((item) => (
              <li key={item.n} className="rounded-card border border-line bg-white p-5 md:p-6">
                <div className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-light text-[12px] font-bold text-brand">
                    {item.n}
                  </span>
                  <div>
                    <h3 className="text-[16px]">{item.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed">{item.text}</p>
                  </div>
                </div>
              </li>
            ))}

            <li className="rounded-card border border-brand/25 bg-light/60 p-5 md:p-6">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-brand-dark">
                <Check size={16} className="text-brand" strokeWidth={3} />
                And today, this is where you come in.
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-body">
                Every order still gets packed by hand. If something is not right,
                tell us — you are writing to the same people who made it.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand hover:text-brand-dark"
              >
                Talk to us
                <ArrowRight size={14} />
              </Link>
            </li>
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="section pt-0">
        <div className="container-gd">
          <div className="relative overflow-hidden rounded-banner border border-line">
            <Image
              src="/assets/images/herbalbanner.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="relative bg-gradient-to-r from-brand-dark/92 via-brand-dark/70 to-brand-dark/20 px-6 py-10 md:px-12 md:py-14">
              <div className="max-w-lg">
                <h2 className="text-cream">The pantry is open.</h2>
                <p className="mt-3 text-[13.5px] leading-relaxed text-cream/80">
                  Start with a jar of ghee or a bar of soap. Everything is made in
                  small batches, packed in glass, and sent from the farm.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/shop" className="btn bg-cream text-brand-dark hover:bg-white">
                    Shop products
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/services"
                    className="btn border border-cream/35 text-cream hover:bg-cream/10"
                  >
                    Our services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
