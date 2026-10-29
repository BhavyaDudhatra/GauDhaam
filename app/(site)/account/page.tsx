import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  LockKeyhole,
  LogOut,
  Package,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { ProfileForm } from "@/components/account/profile-form";
import { PasswordForm } from "@/components/account/password-form";
import { AddressManager } from "@/components/account/address-manager";
import { OrderStatusBadge } from "@/components/ui/order-status";
import { logoutAction } from "@/lib/actions/auth";
import { getSession } from "@/lib/auth";
import { formatDate, formatINR } from "@/lib/money";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Faccount");
  const store = await getStore();
  const user = await store.users.get(session.id);
  if (!user) {
    // Session exists but user is missing from store (e.g. fallback reset).
    // Redirect to login without trying to modify cookies in a Server Component.
    redirect("/login?next=%2Faccount");
  }

  const orders = await store.orders.list({ userId: user.id });
  const spent = orders
    .filter((order) => order.payment.status === "paid")
    .reduce((sum, order) => sum + order.total, 0);
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <section className="border-b border-line bg-light/45">
        <div className="container-gd py-9 md:py-11">
          <span className="eyebrow">My account</span>
          <h1 className="mt-2">Hello, {user.name.split(" ")[0]}.</h1>
          <p className="mt-2 text-[13.5px]">
            Your orders, details and password live here.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-gd grid gap-5 lg:grid-cols-[290px_1fr] lg:gap-7">
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-[15px] font-bold text-white">
                  {initials || "G"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-brand-dark">
                    {user.name}
                  </p>
                  <p className="truncate text-[11.5px] text-body/75">{user.email}</p>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4 text-center">
                <div className="rounded-xl bg-cream py-2.5">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-body/65">
                    Orders
                  </dt>
                  <dd className="text-[16px] font-bold text-brand-dark">
                    {orders.length}
                  </dd>
                </div>
                <div className="rounded-xl bg-cream py-2.5">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-body/65">
                    Spent
                  </dt>
                  <dd className="text-[16px] font-bold text-brand-dark">
                    {formatINR(spent)}
                  </dd>
                </div>
              </dl>

              <nav className="mt-4 space-y-1" aria-label="Account sections">
                <a
                  href="#orders"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-brand-dark transition-colors hover:bg-light"
                >
                  <Package size={16} className="text-brand" />
                  My orders
                </a>
                <a
                  href="#addresses"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-brand-dark transition-colors hover:bg-light"
                >
                  <UserRound size={16} className="text-brand" />
                  Addresses
                </a>
                <a
                  href="#profile"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-brand-dark transition-colors hover:bg-light"
                >
                  <UserRound size={16} className="text-brand" />
                  Profile
                </a>
                <a
                  href="#security"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-brand-dark transition-colors hover:bg-light"
                >
                  <LockKeyhole size={16} className="text-brand" />
                  Password
                </a>
              </nav>

              <form action={logoutAction} className="mt-3 border-t border-line pt-3">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-brown transition-colors hover:bg-[#F6EBE4]"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </form>
            </div>

            <div className="rounded-card border border-line bg-white/60 p-4 text-[11.5px] leading-relaxed text-body/80">
              <p className="font-semibold text-brand-dark">
                Member since {formatDate(user.createdAt)}
              </p>
              <p className="mt-1">
                Need a hand?{" "}
                <Link href="/contact" className="link-underline">
                  Talk to us
                </Link>
                .
              </p>
            </div>
          </aside>

          <div className="space-y-5">
            <section id="orders" className="card overflow-hidden scroll-mt-32">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <h2 className="text-[17px]">My orders</h2>
                  <p className="mt-0.5 text-[11.5px] text-body/70">
                    Track what is on its way and reorder what you loved.
                  </p>
                </div>
                <Link href="/shop" className="btn btn-outline btn-sm">
                  Shop
                  <ArrowRight size={13} />
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-light text-brand">
                    <ShoppingBag size={23} strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-3 text-[16px]">No orders yet</h3>
                  <p className="mt-1.5 max-w-sm text-[12.5px]">
                    When you place your first order it will appear here, with
                    tracking and a quick reorder option.
                  </p>
                  <Link href="/shop" className="btn btn-primary btn-sm mt-4">
                    Start shopping
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {orders.map((order) => (
                    <li key={order.id}>
                      <Link
                        href={`/order/${order.id}`}
                        className="flex flex-wrap items-center gap-3 px-5 py-4 transition-colors hover:bg-cream/60"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-semibold text-brand-dark">
                            {order.number}
                          </p>
                          <p className="mt-0.5 text-[11.5px] text-body/70">
                            {formatDate(order.createdAt)} ·{" "}
                            {order.items.reduce((sum, item) => sum + item.qty, 0)}{" "}
                            items
                          </p>
                        </div>
                        <OrderStatusBadge status={order.status} />
                        <p className="w-20 text-right text-[13.5px] font-bold text-brand-dark">
                          {formatINR(order.total)}
                        </p>
                        <ChevronRight size={16} className="text-body/40" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section id="addresses" className="card scroll-mt-32 p-5 md:p-6">
              <h2 className="text-[17px]">Addresses</h2>
              <p className="mt-0.5 text-[11.5px] text-body/70">
                Manage delivery addresses used at checkout.
              </p>
              <AddressManager addresses={user.addresses ?? []} />
            </section>

            <section id="profile" className="card scroll-mt-32 p-5 md:p-6">
              <h2 className="text-[17px]">Profile</h2>
              <p className="mt-0.5 text-[11.5px] text-body/70">
                Used to prefill your delivery details at checkout.
              </p>
              <ProfileForm
                user={{ name: user.name, email: user.email, phone: user.phone }}
              />
            </section>

            <section id="security" className="card scroll-mt-32 p-5 md:p-6">
              <h2 className="text-[17px]">Password</h2>
              <p className="mt-0.5 text-[11.5px] text-body/70">
                Choose something long and memorable. At least 8 characters.
              </p>
              <PasswordForm />
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
