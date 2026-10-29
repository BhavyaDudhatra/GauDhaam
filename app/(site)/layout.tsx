import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getSession } from "@/lib/auth";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-btn focus:bg-white focus:px-4 focus:py-2 focus:text-brand-dark focus:shadow-soft"
      >
        Skip to content
      </a>
      <Header user={user} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
