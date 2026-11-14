import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  await requireAdmin();
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "";
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";

  const store = await getStore();
  let orders = await store.orders.list();

  if (status && status !== "all") {
    orders = orders.filter((o) => o.status === status);
  }
  if (from) {
    const fromDate = new Date(from);
    orders = orders.filter((o) => new Date(o.createdAt) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    orders = orders.filter((o) => new Date(o.createdAt) <= toDate);
  }

  const headers = [
    "Order Number",
    "Date",
    "Customer Name",
    "Email",
    "Phone",
    "Items",
    "Subtotal",
    "Shipping",
    "Discount",
    "Total",
    "Status",
    "Payment Status",
    "Notes",
  ];

  const rows = orders.map((order) => [
    order.number,
    new Date(order.createdAt).toLocaleDateString("en-IN"),
    order.customerName,
    order.email,
    order.phone,
    order.items.map((i) => `${i.name} (${i.variantLabel}) x${i.qty}`).join("; "),
    order.subtotal,
    order.shipping,
    order.discount || 0,
    order.total,
    order.status,
    order.payment?.status || "",
    order.notes || "",
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
