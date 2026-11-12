import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import type { Order } from "@/lib/types";
import { fmtDate, img, inr } from "@/lib/utils";

export function OrderList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="display text-2xl">No orders yet.</p>
        <Link href="/shop" className="btn btn-dark mt-6">
          Start shopping
        </Link>
      </div>
    );
  }
  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/account/orders/${o.id}`} className="card flex flex-col gap-5 p-6 transition-colors hover:border-ink sm:flex-row sm:items-center">
            <div className="flex -space-x-3">
              {(o.order_items ?? []).slice(0, 3).map((it) => (
                <div key={it.id} className="relative h-16 w-14 overflow-hidden rounded-md border-2 border-white bg-stone-100">
                  <Image src={img(it.product_image, 200)} alt="" fill sizes="56px" className="object-cover" />
                </div>
              ))}
            </div>
            <div className="flex-1">
              <p className="font-medium">#{o.order_number}</p>
              <p className="text-sm text-stone-600">
                {fmtDate(o.created_at)} · {(o.order_items ?? []).reduce((n, i) => n + i.quantity, 0)} items
              </p>
            </div>
            <StatusBadge status={o.status} />
            <span className="font-display text-xl">{inr(o.total)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
