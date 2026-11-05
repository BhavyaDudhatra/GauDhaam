import { getStore } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/firebase";
import { ComplementaryForm } from "@/components/admin/complementary-form";

export const dynamic = "force-dynamic";

export default async function AdminComplementaryPage() {
  await requireAdmin();
  const store = await getStore();
  const [products, services] = await Promise.all([
    store.products.list(),
    store.services.list(),
  ]);
  const db = await getDb();
  let gifts = [];
  if (db) {
    const snap = await db.collection('complementary_gifts').orderBy('createdAt','desc').get();
    gifts = snap.docs.map(d=>({id:d.id,...d.data()}));
  }
  const productItems = products.map(p=>({id:p.id, slug:p.slug, name:p.name}));
  const serviceItems = services.map(s=>({id:s.id, slug:s.slug, name:s.name}));
  return <ComplementaryForm products={productItems} services={serviceItems} gifts={gifts} />;
}
