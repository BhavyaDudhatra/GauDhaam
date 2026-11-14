import type { Metadata } from "next";
import Link from "next/link";
import { getStore } from "@/lib/store";
import { Img } from "@/components/ui/Img";
import { StockEditor } from "@/components/admin/stock-editor";

export const metadata: Metadata = { title: "Inventory · Admin" };
export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const store = await getStore();
  const products = await store.products.list();

  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({
      productId: p.id,
      productName: p.name,
      category: p.category,
      available: p.available,
      variantId: v.id,
      variantLabel: v.label,
      price: v.price,
      stock: v.stock,
      active: v.active,
    })),
  );

  const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);
  const outOfStock = allVariants.filter((v) => v.stock === 0);
  const lowStock = allVariants.filter((v) => v.stock > 0 && v.stock <= 5);
  const totalValue = allVariants.reduce((sum, v) => sum + v.price * v.stock, 0);

  return (
    <div className="space-y-5">
      <h1 className="text-[24px]">Inventory Dashboard</h1>
      <p className="mt-1 text-[13px] text-body">Stock levels across all products and variants.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-body/70">Total SKUs</p>
          <p className="mt-1 text-[22px] font-bold text-brand-dark">{allVariants.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-body/70">Total stock units</p>
          <p className="mt-1 text-[22px] font-bold text-brand-dark">{totalStock}</p>
        </div>
        <div className="card p-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-body/70">Stock value</p>
          <p className="mt-1 text-[22px] font-bold text-brand-dark">₹{totalValue.toLocaleString("en-IN")}</p>
        </div>
        <div className="card p-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-body/70">Low / Out of stock</p>
          <p className="mt-1 text-[22px] font-bold text-amber-700">{lowStock.length + outOfStock.length}</p>
        </div>
      </div>

      {outOfStock.length > 0 && (
        <div className="card p-5 border-red-200 bg-red-50/50">
          <h2 className="text-[17px] text-red-800">Out of Stock ({outOfStock.length})</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="border-b border-line">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Variant</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {outOfStock.map((v) => (
                  <tr key={`${v.productId}-${v.variantId}`}>
                    <td className="px-3 py-2">
                      <Link href={`/admin/products/${v.productId}`} className="font-semibold text-brand-dark hover:text-brand">
                        {v.productName}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-body">{v.variantLabel}</td>
                    <td className="px-3 py-2 text-right">₹{v.price}</td>
                    <td className="px-3 py-2 text-right font-semibold text-red-700">0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="card p-5 border-amber-200 bg-amber-50/50">
          <h2 className="text-[17px] text-amber-800">Low Stock ({lowStock.length})</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="border-b border-line">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Variant</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {lowStock.map((v) => (
                  <tr key={`${v.productId}-${v.variantId}`}>
                    <td className="px-3 py-2">
                      <Link href={`/admin/products/${v.productId}`} className="font-semibold text-brand-dark hover:text-brand">
                        {v.productName}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-body">{v.variantLabel}</td>
                    <td className="px-3 py-2 text-right">₹{v.price}</td>
                    <td className="px-3 py-2 text-right font-semibold text-amber-700">{v.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[17px]">All Variants</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="border-b border-line bg-cream/60">
              <tr>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-left">Variant</th>
                <th className="px-3 py-2 text-left" colSpan={2}>Stock / Price (editable)</th>
                <th className="px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {allVariants
                .sort((a, b) => a.stock - b.stock)
                .map((v) => (
                  <tr key={`${v.productId}-${v.variantId}`}>
                    <td className="px-3 py-2">
                      <Link href={`/admin/products/${v.productId}`} className="font-semibold text-brand-dark hover:text-brand">
                        {v.productName}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-body">{v.variantLabel}</td>
                    <td className="px-3 py-2" colSpan={2}>
                      <StockEditor productId={v.productId} variantId={v.variantId} currentStock={v.stock} currentPrice={v.price} />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`badge ${v.available && v.active ? "badge-green" : "badge-brown"}`}>
                        {v.available && v.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
