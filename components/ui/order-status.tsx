import { orderStatuses } from "@/lib/site";
import type { OrderStatus } from "@/lib/types";

const styles: Record<OrderStatus, string> = {
  pending: "bg-[#FBF1DC] text-[#8A6320]",
  paid: "bg-light text-brand-dark",
  packed: "bg-[#E8F0F4] text-[#2F5C74]",
  shipped: "bg-[#EDE9F7] text-[#514086]",
  delivered: "bg-[#E4F1E4] text-[#2F6B34]",
  cancelled: "bg-[#F6E7E2] text-[#8A3E2C]",
};

const labels: Record<OrderStatus, string> = {
  pending: "Payment pending",
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  if (!orderStatuses.includes(status)) return null;
  return (
    <span className={`badge ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {labels[status]}
    </span>
  );
}

export function paymentStatusLabel(status: string) {
  if (status === "paid") return "Paid online";
  if (status === "failed") return "Payment failed";
  if (status === "refunded") return "Refunded";
  return "Payment pending";
}
