import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel, Table, Td, Empty } from "@/components/admin/ui";
import { StatusBadge } from "@/components/StatusBadge";
import type { Order } from "@/lib/types";
import { fmtDate, inr } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const since = new Date(Date.now() - 29 * 864e5);
  since.setHours(0, 0, 0, 0);

  const [{ data: monthOrders }, { data: recent }, { count: customers }, { count: pendingReviews }, { data: lowStock }, { count: pendingOrders }] =
    await Promise.all([
      supabase.from("orders").select("total, status, created_at").gte("created_at", since.toISOString()),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("products").select("id, name, stock").lte("stock", 5).eq("is_active", true).order("stock").limit(6),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

  const valid = (monthOrders ?? []).filter((o) => o.status !== "cancelled");
  const revenue = valid.reduce((s, o) => s + Number(o.total), 0);
  const aov = valid.length ? revenue / valid.length : 0;

  // 30-day revenue series
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(since.getTime() + i * 864e5);
    return { key: d.toISOString().slice(0, 10), label: d, total: 0 };
  });
  for (const o of valid) {
    const k = new Date(o.created_at).toISOString().slice(0, 10);
    const d = days.find((x) => x.key === k);
    if (d) d.total += Number(o.total);
  }
  const max = Math.max(1, ...days.map((d) => d.total));

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" subtitle="The last 30 days at Atmosfere Living." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Revenue (30d)" value={inr(revenue)} />
        <Kpi label="Orders (30d)" value={String(valid.length)} sub={`${pendingOrders ?? 0} awaiting confirmation`} href="/admin/orders?status=pending" />
        <Kpi label="Avg. order value" value={inr(aov)} />
        <Kpi label="Customers" value={String(customers ?? 0)} sub={`${pendingReviews ?? 0} reviews to moderate`} href="/admin/reviews?status=pending" />
      </div>

      <Panel title="Revenue · last 30 days">
        <div className="flex h-48 items-end gap-1 px-6 pb-4 pt-8" role="img" aria-label="Daily revenue bar chart">
          {days.map((d) => (
            <div key={d.key} className="group relative flex h-full flex-1 items-end">
              <div
                className="w-full rounded-t-sm bg-accent/80 transition-colors group-hover:bg-accent"
                style={{ height: `${Math.max(d.total ? 4 : 1, (d.total / max) * 100)}%`, opacity: d.total ? 1 : 0.25 }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-charcoal px-2 py-1 text-[0.65rem] text-ivory group-hover:block">
                {fmtDate(d.label)} · {inr(d.total)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between px-6 pb-4 text-[0.65rem] text-stone-400">
          <span>{fmtDate(days[0].label)}</span>
          <span>Today</span>
        </div>
      </Panel>

      <div className="grid gap-8 xl:grid-cols-3">
        <Panel
          title="Recent orders"
          className="xl:col-span-2"
          action={
            <Link href="/admin/orders" className="text-xs underline">
              View all
            </Link>
          }
        >
          {(recent ?? []).length === 0 ? (
            <Empty>No orders yet.</Empty>
          ) : (
            <Table head={["Order", "Date", "Customer", "Status", "Total"]}>
              {(recent as Order[]).map((o) => (
                <tr key={o.id} className="hover:bg-stone-100/50">
                  <Td>
                    <Link href={`/admin/orders/${o.id}`} className="font-medium underline-offset-4 hover:underline">
                      #{o.order_number}
                    </Link>
                  </Td>
                  <Td className="text-stone-600">{fmtDate(o.created_at)}</Td>
                  <Td className="text-stone-600">{o.shipping_address?.full_name ?? o.email}</Td>
                  <Td>
                    <StatusBadge status={o.status} />
                  </Td>
                  <Td>{inr(o.total)}</Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>

        <Panel title="Low stock">
          {(lowStock ?? []).length === 0 ? (
            <Empty>All products are well stocked.</Empty>
          ) : (
            <ul className="divide-y divide-stone-200">
              {lowStock!.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-6 py-3 text-sm">
                  <Link href={`/admin/products/${p.id}`} className="hover:underline">
                    {p.name}
                  </Link>
                  <span className={p.stock === 0 ? "badge bg-red-50 text-red-800" : "badge bg-amber-50 text-amber-800"}>{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, href }: { label: string; value: string; sub?: string; href?: string }) {
  const body = (
    <>
      <p className="text-[0.65rem] tracking-[0.2em] uppercase text-stone-600">{label}</p>
      <p className="display mt-3 text-3xl">{value}</p>
      {sub && <p className="mt-2 text-xs text-stone-400">{sub}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="card block p-6 hover:border-ink">
      {body}
    </Link>
  ) : (
    <div className="card p-6">{body}</div>
  );
}
