import type { Metadata } from "next";
import { B2BRequestForm } from "@/components/b2b/b2b-request-form";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bulk & B2B Orders",
  description:
    "Request custom bulk orders for hotels, restaurants, retail and corporate buyers.",
};

export default async function B2BPage() {
  const store = await getStore();
  const [products, session] = await Promise.all([
    store.products.list(),
    getSession(),
  ]);
  const user = session ? await store.users.get(session.id) : null;

  return (
    <div className="container-gd py-8 md:py-10">
      <div className="max-w-3xl">
        <span className="eyebrow">Business Orders</span>
        <h1 className="mt-2">Bulk Custom B2B Ordering</h1>
        <p className="mt-2 text-[13.5px] text-body/80">
          Share your requirements for bulk quantities, delivery frequency,
          packaging and custom timelines. Our team will review and send a
          tailored quote.
        </p>
      </div>
      <div className="card mt-6 p-6 md:p-8">
        <B2BRequestForm
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
          }))}
          defaultContactName={user?.name ?? session?.name ?? ""}
          defaultEmail={user?.email ?? session?.email ?? ""}
          defaultPhone={user?.phone ?? ""}
        />
      </div>
    </div>
  );
}
