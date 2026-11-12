import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OrderList } from "@/components/account/OrderList";
import type { Order } from "@/lib/types";

export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const { user } = await requireUser("/account/orders");
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false });
  return (
    <div>
      <h2 className="display text-3xl">Orders</h2>
      <div className="mt-6">
        <OrderList orders={(data as Order[]) ?? []} />
      </div>
    </div>
  );
}
