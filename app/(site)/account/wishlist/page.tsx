import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { ProductCard } from "@/components/product/product-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Wishlist",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Faccount%2Fwishlist");

  const store = await getStore();
  const user = await store.users.get(session.id);
  if (!user) redirect("/login?next=%2Faccount%2Fwishlist");

  const wishlistIds = user.wishlist ?? [];
  const products = await store.products.list();
  const wishlistProducts = wishlistIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  return (
    <div className="container-gd py-10">
      <h1 className="text-[24px] font-bold">My Wishlist</h1>
      <p className="mt-1 text-[13px] text-body/70">
        {wishlistProducts.length} saved item{wishlistProducts.length !== 1 ? "s" : ""}
      </p>

      {wishlistProducts.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center px-6 py-16 text-center">
          <p className="text-[18px]">Your wishlist is empty</p>
          <p className="mt-2 max-w-sm text-[13.5px]">
            Save products you love by clicking the heart icon.
          </p>
          <Link href="/products" className="btn btn-primary mt-5">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3.5 md:gap-5 lg:grid-cols-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
