import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/ui";
import { OrderControls } from "@/components/admin/OrderControls";
import { StatusBadge } from "@/components/StatusBadge";
import type { Order } from "@/lib/types";
import { fmtDate, img, inr } from "@/lib/utils";

export const metadata = { title: "Order" };

const PAY: Record<string, string> = { cod: "Cash / UPI on delivery", bank_transfer: "Bank transfer", online: "Online" };

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const o = data as Order;
  const a = o.shipping_address;

  return (
    <div>
      <Link href="/admin/orders" className="text-xs tracking-[0.18em] uppercase text-stone-400 hover:text-ink">
        ← Orders
      </Link>
      <PageHeader
        title={`Order #${o.order_number}`}
        subtitle={`Placed ${fmtDate(o.created_at)} · ${PAY[o.payment_method] ?? o.payment_method}`}
        action={
          <div className="flex gap-2">
            <StatusBadge status={o.status} />
            <StatusBadge status={o.payment_status} />
          </div>
        }
      />
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <Panel title="Items">
            <ul className="divide-y divide-stone-200">
              {(o.order_items ?? []).map((it) => (
                <li key={it.id} className="flex items-center gap-4 px-6 py-4 text-sm">
                  <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded bg-stone-100">
                    <Image src={img(it.product_image, 150)} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="flex-1">
                    {it.product_id ? (
                      <Link href={`/admin/products/${it.product_id}`} className="font-medium hover:underline">
                        {it.product_name}
                      </Link>
                    ) : (
                      it.product_name
                    )}
                    <span className="block text-stone-600">
                      {inr(it.unit_price)} × {it.quantity}
                    </span>
                  </span>
                  <span>{inr(it.unit_price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-stone-200 px-6 py-5 text-sm">
              <Row k="Subtotal" v={inr(o.subtotal)} />
              {Number(o.discount_amount) > 0 && <Row k={`Discount (${o.discount_code})`} v={`− ${inr(o.discount_amount)}`} />}
              <Row k="Shipping" v={inr(o.shipping_fee)} />
              <div className="flex justify-between pt-2 text-base">
                <span>Total</span>
                <span className="font-display text-2xl">{inr(o.total)}</span>
              </div>
            </div>
          </Panel>
          {o.notes && (
            <Panel title="Customer notes">
              <p className="px-6 py-5 text-sm text-stone-600">{o.notes}</p>
            </Panel>
          )}
        </div>

        <div className="space-y-8">
          <Panel title="Fulfilment">
            <div className="p-6">
              <OrderControls id={o.id} status={o.status} paymentStatus={o.payment_status} tracking={o.tracking_number} />
            </div>
          </Panel>
          <Panel title="Customer">
            <div className="space-y-1 px-6 py-5 text-sm">
              <p className="font-medium">{a.full_name}</p>
              <p className="text-stone-600">{o.email}</p>
              <p className="text-stone-600">{a.phone}</p>
            </div>
          </Panel>
          <Panel title="Ship to">
            <p className="px-6 py-5 text-sm text-stone-600">
              {a.line1}
              {a.line2 ? <>, {a.line2}</> : null}
              <br />
              {a.city}, {a.state} {a.postal_code}
              <br />
              {a.country}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-stone-600">{k}</span>
      <span>{v}</span>
    </div>
  );
}
