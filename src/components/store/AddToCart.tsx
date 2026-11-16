"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useCart, type CartItem } from "@/components/cart/CartProvider";
import { Qty } from "@/components/cart/CartDrawer";
import { toggleWishlist } from "@/lib/actions/store";
import { cx, inr, priceWithOptions, usableOptions } from "@/lib/utils";
import type { ProductOption } from "@/lib/types";

export function AddToCart({
  product,
  options,
  comingSoon = false,
  saved: initialSaved,
  signedIn,
}: {
  product: Omit<CartItem, "quantity" | "lineId" | "options">;
  options?: ProductOption[] | null;
  comingSoon?: boolean;
  saved: boolean;
  signedIn: boolean;
}) {
  const { add } = useCart();
  const router = useRouter();
  const choices = usableOptions(options);
  const [chosen, setChosen] = useState<Record<string, string>>(() => Object.fromEntries(choices.map((o) => [o.name, o.values[0].label])));
  const [qty, setQty] = useState(1);
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();
  const soldOut = product.stock <= 0;
  const price = priceWithOptions(product.price, choices, chosen);
  const hasExtras = choices.some((o) => o.values.some((v) => Number(v.price) > 0));

  return (
    <div className="space-y-8">
      {choices.map((o) => (
        <fieldset key={o.name}>
          <legend className="text-[0.7rem] font-medium tracking-[0.2em] uppercase">
            {o.name}: <span className="font-normal normal-case tracking-normal text-stone-600">{chosen[o.name]}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {o.values.map((v) => {
              const active = chosen[o.name] === v.label;
              return (
                <button
                  key={v.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setChosen((c) => ({ ...c, [o.name]: v.label }))}
                  className={cx(
                    "min-h-10 rounded-full border px-4 text-sm transition-colors cursor-pointer",
                    active ? "border-ink bg-ink text-ivory" : "border-stone-200 hover:border-ink",
                  )}
                >
                  {v.label}
                  {!comingSoon && Number(v.price) > 0 && <span className={cx("ml-1 text-xs", active ? "text-ivory/70" : "text-stone-400")}>+{inr(v.price)}</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {comingSoon ? (
        <div className="space-y-3">
          <button disabled className="btn btn-dark w-full">
            Coming soon
          </button>
          <p className="text-xs text-stone-600">This piece launches soon. Prices and ordering open at launch.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hasExtras && (
            <p className="text-sm text-stone-600">
              Price for your selection: <span className="font-display text-lg text-ink">{inr(price)}</span>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {!soldOut && <Qty value={qty} max={product.stock} onChange={(n) => setQty(Math.max(1, n))} />}
            <button disabled={soldOut} onClick={() => add({ ...product, price, options: chosen }, qty)} className="btn btn-dark min-w-[9rem] flex-1">
              {soldOut ? "Sold out" : "Add to bag"}
            </button>
            <button
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              disabled={pending}
              onClick={() => {
                if (!signedIn) return router.push(`/login?next=/products/${product.slug}`);
                start(async () => {
                  const r = await toggleWishlist(product.productId);
                  if (r.ok) setSaved(!!r.data?.saved);
                });
              }}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-stone-200 hover:border-ink cursor-pointer"
            >
              <Heart size={17} strokeWidth={1.4} fill={saved ? "currentColor" : "none"} className={saved ? "text-accent" : ""} />
            </button>
          </div>
          {!soldOut && product.stock <= 5 && <p className="text-xs text-accent">Only {product.stock} left in stock.</p>}
        </div>
      )}
    </div>
  );
}

