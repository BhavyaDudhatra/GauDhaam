"use client";

import {
  Building2,
  CalendarClock,
  Gift,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/site/logo";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/services", label: "Services", icon: Sparkles },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CalendarClock },
  { href: "/admin/b2b", label: "B2B Quotes", icon: Building2 },
  { href: "/admin/coupons", label: "Coupons", icon: Gift },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/events", label: "Events", icon: CalendarClock },
  { href: "/admin/gallery", label: "Gallery", icon: Sparkles },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-line bg-cream">
      <div className="flex h-16 items-center border-b border-line px-6">
        <Logo compact />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors ${
                active
                  ? "bg-brand text-white"
                  : "text-brand-dark hover:bg-light"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line p-4">
        <Link
          href="/"
          className="block text-center text-[12px] font-semibold text-brand hover:underline"
        >
          View storefront
        </Link>
      </div>
    </aside>
  );
}
