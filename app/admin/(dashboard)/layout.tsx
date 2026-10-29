import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-cream">
      <AdminSidebar />
      <AdminHeader user={session} />
      <main className="ml-64 pt-16">
        <div className="mx-auto max-w-[1400px] px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
