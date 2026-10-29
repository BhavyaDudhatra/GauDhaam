import { redirect } from "next/navigation";

export default function ShopRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams;
  void params;
  redirect("/products");
}
