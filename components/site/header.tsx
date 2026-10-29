"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "./logo";
import { useCart } from "@/components/cart/cart-context";
import { ThemeToggle } from "@/components/theme-provider";
import { site } from "@/lib/site";
import type { SessionUser } from "@/lib/types";

const headerNavLinks = [
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "Subscriptions", href: "/subscriptions" },
  { label: "B2B", href: "/b2b" },
  { label: "Contact", href: "/contact" },
  { label: "About Us", href: "/about" },
];

export function Header({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const { count, hydrated, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    const path = href.split("?")[0];
    if (path === "/products") return pathname.startsWith("/products") || pathname.startsWith("/product");
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-line bg-light dark:bg-[#1f251f] dark:border-[#2a322a]">
        <div className="container-gd flex h-8 items-center justify-between text-[11px] font-semibold text-brand-dark dark:text-[#d4d4d4]">
          <p className="truncate">Free delivery on orders above ₹{site.freeShippingAbove}</p>
          <p className="hidden items-center gap-4 sm:flex">
            <span className="text-brand/70 dark:text-[#a0b0a0]">Farm-direct · Made in small batches</span>
            <a href={`tel:${site.phoneHref}`} className="hover:text-brand dark:hover:text-[#8ba888]">
              {site.phone}
            </a>
          </p>
        </div>
      </div>

      <div className="border-b border-line bg-cream/95 backdrop-blur dark:bg-[#1a1f1a]/95 dark:border-[#2a322a]">
        <div className="container-gd flex h-16 items-center justify-between gap-3 md:h-20">
          <Logo />
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {headerNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-full px-3 py-2 text-[13.5px] font-semibold transition-colors ${
                  isActive(link.href)
                    ? "bg-light text-brand-dark dark:bg-[#2a322a] dark:text-[#e8f0e8]"
                    : "text-body hover:bg-light/70 hover:text-brand-dark dark:text-[#b0b0b0] dark:hover:bg-[#2a322a] dark:hover:text-[#e8f0e8]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <Link href={user ? "/account" : "/login"} className="btn btn-ghost btn-sm hidden md:inline-flex">
              <User size={16} />
              {user ? "Account" : "Sign in"}
            </Link>
            <button type="button" onClick={openCart} className="btn btn-ghost btn-sm">
              <ShoppingBag size={16} />
              <span>Cart</span>
              {hydrated && count > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
            <button type="button" className="btn btn-ghost btn-sm lg:hidden" onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
              <span className="sr-only">Toggle menu</span>
            </button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="border-b border-line bg-cream lg:hidden dark:bg-[#1a1f1a] dark:border-[#2a322a]">
          <nav className="container-gd flex flex-col py-2">
            {headerNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-xl px-2 py-2 text-[14px] font-semibold ${
                  isActive(link.href) ? "text-brand-dark" : "text-body"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href={user ? "/account" : "/login"} className="rounded-xl px-2 py-2 text-[14px] font-semibold text-body">
              {user ? "My account" : "Sign in / Create account"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
