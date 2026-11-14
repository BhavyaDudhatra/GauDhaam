import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

export async function POST() {
  await requireAdmin();
  const store = await getStore();
  const users = await store.users.list();

  // In a real implementation, this would check for carts with items
  // that haven't been checked out in 24h. For now, we just log the intent.
  // Full implementation requires tracking cart activity timestamps.

  let sent = 0;
  for (const user of users) {
    if (user.role === "admin") continue;
    // Check if user has recent orders - if not, they might have abandoned cart
    const orders = await store.orders.list({ userId: user.id });
    const recentOrder = orders.find((o) => {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      const diffHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
      return diffHours < 24;
    });
    if (!recentOrder) {
      // User hasn't ordered in 24h - could send abandoned cart email
      // For now, just count
      sent++;
    }
  }

  return NextResponse.json({ ok: true, checked: users.length, potentialAbandoned: sent });
}
