"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { Qty } from "@/components/cart/CartDrawer";
import { img, inr, shippingFor } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, update, remove, ready } = useCart();
  const shipping = shippingFor(subtotal);

  return (
    <div className="container-lux pb-28 pt-16 md:pt-24">
      <p className="eyebrow">Your bag</p>
      <h1 className="display mt-4 text-[clamp(2.5rem,5vw,4rem)]">Shopping bag</h1>

      {!ready ? null : items.length === 0 ? (
        <div className="py-28 text-center">
          <p className="display text-3xl">Your bag is empty.</p>
          <Link href="/shop" className="btn btn-dark mt-8">
            Explore the shop
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-14 lg:grid-cols-12">
          <ul className="divide-y divide-stone-200 border-y border-stone-200 lg:col-span-8">
            {items.map((i) => (
              <li key={i.productId} className="flex gap-6 py-7">
                <Link href={`/products/${i.slug}`} className="relative h-36 w-28 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  <Image src={img(i.image, 400)} alt={i.name} fill sizes="112px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <Link href={`/products/${i.slug}`} className="font-display text-xl">
                      {i.name}
                    </Link>
                    <button onClick={() => remove(i.productId)} aria-label={`Remove ${i.name}`} className="text-stone-400 hover:text-ink cursor-pointer">
                      <X size={18} strokeWidth={1.4} />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-stone-600">{inr(i.price)}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <Qty value={i.quantity} max={i.stock} onChange={(q) => update(i.productId, q)} />
                    <span className="font-display text-lg">{inr(i.price * i.quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="lg:col-span-4">
            <div className="card space-y-4 p-8">
              <h2 className="display text-2xl">Summary</h2>
              <Row k="Subtotal" v={inr(subtotal)} />
              <Row k="Shipping" v={shipping === 0 ? "Complimentary" : inr(shipping)} />
              <p className="text-xs text-stone-600">Discount codes can be applied at checkout.</p>
              <div className="flex justify-between border-t border-stone-200 pt-4">
                <span>Estimated total</span>
                <span className="font-display text-2xl">{inr(subtotal + shipping)}</span>
              </div>
              <Link href="/checkout" className="btn btn-dark w-full">
                Proceed to checkout
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-stone-600">{k}</span>
      <span>{v}</span>
    </div>
  );
}
