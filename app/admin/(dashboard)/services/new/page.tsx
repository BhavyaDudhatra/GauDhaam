import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ServiceForm } from "@/components/admin/service-form";

export const metadata: Metadata = { title: "New service · Admin" };

export default function NewServicePage() {
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
        <h1 className="mt-2 text-[24px]">New service</h1>
      </div>
      <ServiceForm />
    </div>
  );
}
