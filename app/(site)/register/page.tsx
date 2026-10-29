import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Leaf } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a GauDhaam account to check out faster, follow your orders and keep your details in one place.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "" } = await searchParams;
  const session = await getSession();
  if (session) {
    const store = await getStore();
    const user = await store.users.get(session.id);
    if (user) redirect(next.startsWith("/") ? next : "/account");
    // If session exists but user is missing from store, fall through to show the form.
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
        <div className="relative hidden min-h-[640px] lg:block">
          <Image
            src="/assets/images/conus.jpg"
            alt="Fields at the GauDhaam farm"
            fill
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-cream">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-light/80">
              <Leaf size={13} />
              Join the table
            </span>
            <p className="mt-3 max-w-xs text-[19px] font-semibold leading-snug">
              A small account, a simpler way to keep your pantry stocked.
            </p>
            <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-cream/80">
              We write rarely — only when a new batch is ready or a harvest is
              unusually good.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-9 md:p-10">
          <span className="eyebrow">Create an account</span>
          <h1 className="mt-2 text-[24px]">Come in, the kettle is on</h1>
          <p className="mt-2 text-[13px] leading-relaxed">
            Save your details for faster checkout and keep every order in one
            place.
          </p>

          <AuthForm mode="register" next={safeNext} />
        </div>
      </div>
    </div>
  );
}
