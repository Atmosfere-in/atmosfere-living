"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "./CartProvider";
import { FREE_SHIPPING_THRESHOLD, cx, img, inr } from "@/lib/utils";

export function CartDrawer() {
  const { items, open, setOpen, subtotal, update, remove } = useCart();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className={cx("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <div
        onClick={() => setOpen(false)}
        className={cx("absolute inset-0 bg-charcoal/40 transition-opacity duration-500", open ? "opacity-100" : "opacity-0")}
      />
      <aside
        role="dialog"
        aria-label="Shopping bag"
        className={cx(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory transition-transform duration-700 ease-lux",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <h2 className="display text-2xl">Your bag</h2>
          <button aria-label="Close bag" onClick={() => setOpen(false)} className="cursor-pointer">
            <X size={20} strokeWidth={1.4} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="display text-2xl">Your bag is empty.</p>
            <p className="text-sm text-stone-600">Start with a corner — a lamp, a vase, a chair.</p>
            <Link href="/shop" onClick={() => setOpen(false)} className="btn btn-dark">
              Explore the shop
            </Link>
          </div>
        ) : (
          <>
            <div className="px-6 pt-5">
              <p className="text-xs text-stone-600">
                {remaining > 0 ? (
                  <>
                    Add <span className="text-ink">{inr(remaining)}</span> more for complimentary shipping.
                  </>
                ) : (
                  "Your order ships complimentary."
                )}
              </p>
              <div className="mt-2 h-px w-full bg-stone-200">
                <div className="h-px bg-accent transition-all duration-700" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
              </div>
            </div>
            <ul className="flex-1 divide-y divide-stone-200 overflow-y-auto px-6">
              {items.map((i) => (
                <li key={i.productId} className="flex gap-4 py-5">
                  <Link href={`/products/${i.slug}`} onClick={() => setOpen(false)} className="relative h-28 w-22 shrink-0 overflow-hidden bg-stone-100">
                    <Image src={img(i.image, 300)} alt={i.name} fill sizes="88px" className="object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link href={`/products/${i.slug}`} onClick={() => setOpen(false)} className="font-display text-lg leading-tight">
                        {i.name}
                      </Link>
                      <button aria-label={`Remove ${i.name}`} onClick={() => remove(i.productId)} className="text-stone-400 hover:text-ink cursor-pointer">
                        <X size={16} strokeWidth={1.4} />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-stone-600">{inr(i.price)}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <Qty value={i.quantity} max={i.stock} onChange={(q) => update(i.productId, q)} />
                      <span className="text-sm">{inr(i.price * i.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-stone-200 px-6 py-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-display text-xl">{inr(subtotal)}</span>
              </div>
              <p className="text-xs text-stone-600">Shipping and discounts are calculated at checkout.</p>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-dark w-full">
                Checkout
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="block text-center text-xs tracking-[0.2em] uppercase text-stone-600 hover:text-ink">
                View bag
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export function Qty({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="inline-flex h-9 items-center rounded-full border border-stone-200">
      <button aria-label="Decrease quantity" onClick={() => onChange(value - 1)} className="grid h-9 w-9 place-items-center cursor-pointer">
        <Minus size={13} strokeWidth={1.5} />
      </button>
      <span className="w-6 text-center text-sm tabular-nums">{value}</span>
      <button
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="grid h-9 w-9 place-items-center cursor-pointer disabled:opacity-30"
      >
        <Plus size={13} strokeWidth={1.5} />
      </button>
    </div>
  );
}
