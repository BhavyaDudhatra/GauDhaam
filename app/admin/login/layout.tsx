import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { redirect } from "next/navigation";

export default async function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session?.role === "admin") {
    // Verify user still exists in store
    const store = await getStore();
    const user = await store.users.get(session.id);
    if (user && user.role === "admin") {
      redirect("/admin");
    }
  }
  return children;
}
