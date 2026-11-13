import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel, Table, Td, Empty, FilterTabs } from "@/components/admin/ui";
import { StatusBadge } from "@/components/StatusBadge";
import type { Order, OrderStatus } from "@/lib/types";
import { fmtDate, inr } from "@/lib/utils";

export const metadata = { title: "Orders" };

const STATUSES: [string, string][] = [
  ["", "All"],
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["processing", "Processing"],
  ["shipped", "Shipped"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
];

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("orders").select("*, order_items(quantity)").order("created_at", { ascending: false }).limit(200);
  if (status) query = query.eq("status", status as OrderStatus);
  if (q) query = query.or(`order_number.ilike.%${q.replace(/[%,()]/g, "")}%,email.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const { data } = await query;
  const orders = (data as Order[]) ?? [];

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${orders.length} shown`} />
      <form className="mb-4 flex gap-3">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Search order # or email" className="field !min-h-10 max-w-xs" />
        <button className="btn btn-outline !min-h-10 bg-white">Search</button>
      </form>
      <FilterTabs base="/admin/orders" current={status} options={STATUSES} />
      <Panel>
        {orders.length === 0 ? (
          <Empty>No orders match.</Empty>
        ) : (
          <Table head={["Order", "Date", "Customer", "Items", "Payment", "Status", "Total"]}>
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-stone-100/50">
                <Td>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                    #{o.order_number}
                  </Link>
                </Td>
                <Td className="text-stone-600">{fmtDate(o.created_at)}</Td>
                <Td>
                  <span className="block">{o.shipping_address?.full_name}</span>
                  <span className="block text-xs text-stone-400">{o.email}</span>
                </Td>
                <Td>{(o.order_items ?? []).reduce((n, i) => n + i.quantity, 0)}</Td>
                <Td>
                  <StatusBadge status={o.payment_status} />
                </Td>
                <Td>
                  <StatusBadge status={o.status} />
                </Td>
                <Td>{inr(o.total)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
