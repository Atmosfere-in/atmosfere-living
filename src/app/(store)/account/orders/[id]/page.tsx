import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { CancelOrderButton } from "@/components/account/CancelOrderButton";
import type { Order, OrderStatus } from "@/lib/types";
import { cx, fmtDate, img, inr } from "@/lib/utils";

const STEPS: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];
const PAY: Record<string, string> = { cod: "Cash / UPI on delivery", bank_transfer: "Bank transfer", online: "Online" };

export default async function OrderDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> }) {
  const { id } = await params;
  const { placed } = await searchParams;
  const { user } = await requireUser(`/account/orders/${id}`);
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!data) notFound();
  const o = data as Order;
  const a = o.shipping_address;
  const stepIdx = STEPS.indexOf(o.status);

  return (
    <div className="space-y-10">
      {placed && (
        <div className="rounded-[14px] bg-charcoal p-8 text-ivory">
          <p className="eyebrow !text-stone-400">Thank you</p>
          <p className="display mt-3 text-3xl">Your order is placed.</p>
          <p className="mt-2 text-sm text-ivory/70">We&apos;ve received order #{o.order_number} and will confirm it shortly.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/account/orders" className="text-xs tracking-[0.18em] uppercase text-stone-400 hover:text-ink">
            ← Orders
          </Link>
          <h2 className="display mt-2 text-3xl">Order #{o.order_number}</h2>
          <p className="text-sm text-stone-600">Placed {fmtDate(o.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={o.status} />
          <StatusBadge status={o.payment_status} />
        </div>
      </div>

      {o.status !== "cancelled" && (
        <ol className="grid grid-cols-5 gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="space-y-2">
              <div className={cx("h-0.5 rounded-full", i <= stepIdx ? "bg-accent" : "bg-stone-200")} />
              <p className={cx("text-[0.62rem] tracking-[0.16em] uppercase", i <= stepIdx ? "text-ink" : "text-stone-400")}>{s}</p>
            </li>
          ))}
        </ol>
      )}
      {o.tracking_number && (
        <p className="text-sm">
          Tracking number: <span className="font-medium">{o.tracking_number}</span>
        </p>
      )}

      <div className="grid gap-8 md:grid-cols-5">
        <ul className="card divide-y divide-stone-200 md:col-span-3">
          {(o.order_items ?? []).map((it) => (
            <li key={it.id} className="flex items-center gap-4 p-5">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-stone-100">
                <Image src={img(it.product_image, 200)} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-display text-lg">{it.product_name}</p>
                <p className="text-sm text-stone-600">
                  {inr(it.unit_price)} × {it.quantity}
                </p>
              </div>
              <span>{inr(it.unit_price * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-6 md:col-span-2">
          <div className="card space-y-2 p-6 text-sm">
            <Row k="Subtotal" v={inr(o.subtotal)} />
            {Number(o.discount_amount) > 0 && <Row k={`Discount (${o.discount_code})`} v={`− ${inr(o.discount_amount)}`} />}
            <Row k="Shipping" v={Number(o.shipping_fee) === 0 ? "Complimentary" : inr(o.shipping_fee)} />
            <div className="flex justify-between border-t border-stone-200 pt-3">
              <span>Total</span>
              <span className="font-display text-xl">{inr(o.total)}</span>
            </div>
            <p className="pt-2 text-stone-600">Payment: {PAY[o.payment_method] ?? o.payment_method}</p>
          </div>
          <div className="card p-6 text-sm">
            <p className="label">Shipping to</p>
            <p className="font-medium">{a.full_name}</p>
            <p className="text-stone-600">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}
              <br />
              {a.city}, {a.state} {a.postal_code}
              <br />
              {a.phone}
            </p>
          </div>
          {(o.status === "pending" || o.status === "confirmed") && <CancelOrderButton orderId={o.id} />}
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
