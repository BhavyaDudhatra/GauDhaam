import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ServiceForm } from "@/components/admin/service-form";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Edit service · Admin" };
export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getStore();
  const service = await store.services.get(id);
  if (!service) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline"
        >
          <ArrowLeft size={14} />
          Services
        </Link>
        <h1 className="mt-2 text-[24px]">{service.name}</h1>
      </div>
      <ServiceForm service={service} />
    </div>
  );
}
