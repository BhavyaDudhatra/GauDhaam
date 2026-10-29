import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check, Leaf } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your GauDhaam account to track orders and manage your details.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "" } = await searchParams;
  const session = await getSession();

  if (session) {
    const store = await getStore();
    const user = await store.users.get(session.id);
    if (user) {
      redirect(
        next.startsWith("/") && !next.startsWith("//")
          ? next
          : session.role === "admin"
            ? "/admin"
            : "/account",
      );
    }
    // If session exists but user is missing from store (fallback reset),
    // fall through to render the login form instead of redirecting.
  }

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "";

  return (
    <div className="container-gd py-8 md:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand hover:text-brand-dark"
      >
        <ArrowLeft size={14} />
        Back to shop
      </Link>

      <div className="mt-4 grid overflow-hidden rounded-banner border border-line bg-white lg:grid-cols-2">
        <div className="relative hidden min-h-[560px] lg:block">
          <Image
            src="/assets/images/aboutus.jpg"
            alt="The GauDhaam farm at golden hour"
            fill
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-cream">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-light/80">
              <Leaf size={13} />
              Welcome back
            </span>
            <p className="mt-3 max-w-xs text-[19px] font-semibold leading-snug">
              Your jars, your orders, your details — all in one place.
            </p>
            <ul className="mt-4 space-y-2 text-[12px] text-cream/85">
              {["Track every order", "Reorder favourites", "Save your delivery address"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-cream/20">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="p-6 sm:p-9 md:p-10">
          <span className="eyebrow">Sign in</span>
          <h1 className="mt-2 text-[24px]">Good to see you again</h1>
          <p className="mt-2 text-[13px] leading-relaxed">
            Sign in with the email you used at checkout. New here? You can create
            an account in a minute.
          </p>

          <AuthForm mode="login" next={safeNext} />

          <p className="mt-5 rounded-xl bg-light/70 p-3 text-[11px] leading-relaxed text-body/80">
            Shopping as a guest is always fine too. You can{" "}
            <Link href="/shop" className="link-underline">
              browse the pantry
            </Link>{" "}
            without an account. Need help? {site.email}
          </p>
        </div>
      </div>
    </div>
  );
}
