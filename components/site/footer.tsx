import Link from "next/link";
import {
  Instagram,
  Facebook,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Logo } from "./logo";
import { categories, site } from "@/lib/site";

const shopLinks = categories.map((category) => ({
  label: category.name,
  href: `/shop?category=${encodeURIComponent(category.name)}`,
}));

const helpLinks = [
  { label: "Shipping & delivery", href: "/policies/shipping" },
  { label: "Returns & refunds", href: "/policies/refund" },
  { label: "Privacy policy", href: "/policies/privacy" },
  { label: "Terms of use", href: "/policies/terms" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-cream">
      <div className="container-gd grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-body">
            Small-batch ghee, raw honey, herbal care and handmade soap. Made
            slowly, packed in glass and paper, and sent straight from our farm.
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href={site.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-brand transition-colors hover:border-brand"
            >
              <Instagram size={16} />
            </a>
            <a
              href={site.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-brand transition-colors hover:border-brand"
            >
              <Facebook size={16} />
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-brand-dark">
            Shop
          </h2>
          <ul className="mt-4 space-y-2.5 text-[13.5px]">
            {shopLinks.map((link) => (
              <li key={link.href}>
                <Link className="text-body transition-colors hover:text-brand" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="text-body transition-colors hover:text-brand" href="/services">
                Services
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-brand-dark">
            GauDhaam
          </h2>
          <ul className="mt-4 space-y-2.5 text-[13.5px]">
            <li>
              <Link className="text-body transition-colors hover:text-brand" href="/about">
                Our story
              </Link>
            </li>
            <li>
              <Link className="text-body transition-colors hover:text-brand" href="/contact">
                Contact us
              </Link>
            </li>
            <li>
              <Link className="text-body transition-colors hover:text-brand" href="/account">
                My account
              </Link>
            </li>
            {helpLinks.map((link) => (
              <li key={link.href}>
                <Link className="text-body transition-colors hover:text-brand" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-brand-dark">
            Reach us
          </h2>
          <ul className="mt-4 space-y-3 text-[13.5px]">
            <li className="flex gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
              <span>{site.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone size={16} className="mt-0.5 shrink-0 text-brand" />
              <a href={`tel:${site.phoneHref}`} className="hover:text-brand">
                {site.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail size={16} className="mt-0.5 shrink-0 text-brand" />
              <a href={`mailto:${site.email}`} className="hover:text-brand">
                {site.email}
              </a>
            </li>
          </ul>
          <p className="mt-4 text-[12px] text-body/80">{site.hours}</p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-gd flex flex-col items-center justify-between gap-2 py-5 text-[12px] text-body/80 sm:flex-row">
          <p>© {new Date().getFullYear()} GauDhaam. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Secure payments by Razorpay</span>
            <span className="h-1 w-1 rounded-full bg-line" />
            <span>Made with care in India</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
