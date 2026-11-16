"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useCart, type CartItem } from "@/components/cart/CartProvider";
import { Qty } from "@/components/cart/CartDrawer";
import { toggleWishlist } from "@/lib/actions/store";
import { inr, initialChoices, priceWithOptions, usableOptions } from "@/lib/utils";
import { OptionPicker } from "./OptionPicker";
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
  const [chosen, setChosen] = useState<Record<string, string>>(() => initialChoices(choices));
  const [qty, setQty] = useState(1);
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();
  const soldOut = product.stock <= 0;
  const price = priceWithOptions(product.price, choices, chosen);
  const hasExtras = choices.some((o) => o.values.some((v) => Number(v.price) > 0));

  return (
    <div className="space-y-8">
      <OptionPicker options={choices} chosen={chosen} onChange={(name, value) => setChosen((c) => ({ ...c, [name]: value }))} showExtraPrice={!comingSoon} />

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

