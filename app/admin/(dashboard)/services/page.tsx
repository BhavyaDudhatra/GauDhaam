import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { deleteServiceAction, toggleServiceAction } from "@/lib/actions/admin";
import { getStore } from "@/lib/store";
import { FilterSortBar } from "@/components/ui/filter-sort-bar";
import { normalizeDriveLink } from "@/lib/drive-utils";

export const metadata: Metadata = { title: "Services · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; q?: string; sort?: string; order?: string; status?: string }>;
}) {
  const { saved, q, sort, order, status } = await searchParams;
  const store = await getStore();
  let services = await store.services.list({ includeInactive: true });

  if (q) {
    const lower = q.toLowerCase();
    services = services.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.tagline.toLowerCase().includes(lower) ||
        s.description.toLowerCase().includes(lower),
    );
  }

  if (status === "visible") {
    services = services.filter((s) => s.active);
  } else if (status === "hidden") {
    services = services.filter((s) => !s.active);
  }

  if (sort) {
    const dir = order === "desc" ? -1 : 1;
    services.sort((a, b) => {
      let aVal: any = a[sort as keyof typeof a];
      let bVal: any = b[sort as keyof typeof b];
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal ?? "").toLowerCase();
      }
      if (sort.includes("At")) {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px]">Services</h1>
          <p className="mt-1 text-[13px] text-body">
            {services.length} services · shown separately from products
          </p>
        </div>
        <Link href="/admin/services/new" className="btn btn-primary btn-sm">
          <Plus size={15} />
          New service
        </Link>
      </div>

      <FilterSortBar
        searchPlaceholder="Search services..."
        filterOptions={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "visible", label: "Visible" },
              { value: "hidden", label: "Hidden" },
            ],
          },
        ]}
        sortOptions={[
          { value: "name", label: "Name" },
          { value: "sort", label: "Sort order" },
          { value: "createdAt", label: "Date added" },
          { value: "active", label: "Status" },
        ]}
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[12.5px]">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-[0.08em] text-body/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Price note</th>
                <th className="px-4 py-3 font-semibold">Sort</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-light">
                        <Img
                          src={service.images[0] ?? "/assets/images/banner.jpg"}
                          alt={service.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/services/${service.id}`}
                          className="font-semibold text-brand-dark hover:text-brand"
                        >
                          {service.name}
                        </Link>
                        <p className="line-clamp-1 text-[11px] text-body/70">
                          {service.tagline}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-body">{service.priceNote || "—"}</td>
                  <td className="px-4 py-3 text-body">{service.sort}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        service.active ? "badge-green" : "badge-brown"
                      }`}
                    >
                      {service.active ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`/admin/services/${service.id}`}
                        className="text-[12px] font-semibold text-brand hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={toggleServiceAction}>
                        <input type="hidden" name="id" value={service.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={service.active ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className="text-[12px] font-semibold text-body hover:text-brand-dark"
                        >
                          {service.active ? "Hide" : "Show"}
                        </button>
                      </form>
                      <form action={deleteServiceAction}>
                        <input type="hidden" name="id" value={service.id} />
                        <button
                          type="submit"
                          className="text-[12px] font-semibold text-brown hover:underline"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-body">
                    No services yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
