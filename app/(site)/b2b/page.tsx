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
  const session = await getSession();
  const user = session ? await store.users.get(session.id) : null;
  const products = await store.products.list();

  return (
    <div className="container-gd py-8 md:py-10">
      <div className="max-w-3xl">
        <span className="eyebrow">Business Orders</span>
        <h1 className="mt-2">Bulk & Hamper Orders</h1>
        <p className="mt-2 text-[13.5px] text-body/80">
          Request bulk buying or hampers. Choose self pickup or delivery and get an instant delivery estimate.
        </p>
      </div>
      <div className="card mt-6 p-6 md:p-8">
        <B2BRequestForm
          products={products.map(p=>({id:p.id,name:p.name}))}
          defaultContactName={user?.name ?? session?.name ?? ""}
          defaultPhone={user?.phone ?? ""}
        />
      </div>

    </div>
  );
}
