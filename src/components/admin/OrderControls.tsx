"use client";

import { useState, useTransition } from "react";
import { updateOrder } from "@/lib/actions/admin";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENTS: PaymentStatus[] = ["unpaid", "paid", "refunded", "failed"];

export function OrderControls({
  id,
  status: s0,
  paymentStatus: p0,
  tracking: t0,
}: {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  tracking: string | null;
}) {
  const [status, setStatus] = useState(s0);
  const [payment, setPayment] = useState(p0);
  const [tracking, setTracking] = useState(t0 ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = status !== s0 || payment !== p0 || tracking !== (t0 ?? "");

  return (
    <div className="space-y-5">
      <div>
        <label className="label">Order status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="field capitalize" disabled={s0 === "cancelled"}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {s0 === "cancelled" && <p className="mt-1 text-xs text-stone-400">Cancelled orders are final; stock has been restored.</p>}
        {status === "cancelled" && s0 !== "cancelled" && <p className="mt-1 text-xs text-amber-700">Cancelling returns all items to stock.</p>}
      </div>
      <div>
        <label className="label">Payment status</label>
        <select value={payment} onChange={(e) => setPayment(e.target.value as PaymentStatus)} className="field capitalize">
          {PAYMENTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Tracking number</label>
        <input value={tracking} onChange={(e) => setTracking(e.target.value)} className="field" placeholder="e.g. Delhivery AWB" />
      </div>
      {msg && <p className={msg.ok ? "text-sm text-emerald-700" : "text-sm text-red-700"}>{msg.text}</p>}
      <button
        disabled={!dirty || pending}
        onClick={() =>
          start(async () => {
            const r = await updateOrder(id, { status, payment_status: payment, tracking_number: tracking || null });
            setMsg(r.ok ? { ok: true, text: "Order updated." } : { ok: false, text: r.error });
          })
        }
        className="btn btn-dark w-full"
      >
        {pending ? "Saving…" : "Update order"}
      </button>
    </div>
  );
}
