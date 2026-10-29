import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session?.role === "admin") {
    redirect("/admin");
  }
  return children;
}
