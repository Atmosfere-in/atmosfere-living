import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OrderList } from "@/components/account/OrderList";
import type { Order } from "@/lib/types";
import { inr } from "@/lib/utils";

export default async function AccountOverview({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  const { user } = await requireUser();
  const supabase = await createClient();
  const [{ data: orders }, { count: wishCount }, { count: addrCount }] = await Promise.all([
    supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("wishlist").select("product_id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("addresses").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  const list = (orders as Order[]) ?? [];
  const spent = list.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="space-y-12">
      {denied && <p className="rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-900">That area is for administrators only.</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Orders" value={String(list.length)} href="/account/orders" />
        <Stat label="Saved pieces" value={String(wishCount ?? 0)} href="/account/wishlist" />
        <Stat label="Addresses" value={String(addrCount ?? 0)} href="/account/addresses" />
      </div>
      {spent > 0 && <p className="text-sm text-stone-600">Lifetime spend: {inr(spent)}</p>}
      <section>
        <div className="flex items-end justify-between">
          <h2 className="display text-3xl">Recent orders</h2>
          <Link href="/account/orders" className="link-underline">
            All orders
          </Link>
        </div>
        <div className="mt-6">
          <OrderList orders={list} />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="card block p-6 transition-colors hover:border-ink">
      <p className="text-[0.68rem] tracking-[0.22em] uppercase text-stone-600">{label}</p>
      <p className="display mt-3 text-4xl">{value}</p>
    </Link>
  );
}
