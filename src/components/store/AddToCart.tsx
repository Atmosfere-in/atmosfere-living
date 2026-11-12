"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useCart, type CartItem } from "@/components/cart/CartProvider";
import { Qty } from "@/components/cart/CartDrawer";
import { toggleWishlist } from "@/lib/actions/store";

export function AddToCart({
  product,
  saved: initialSaved,
  signedIn,
}: {
  product: Omit<CartItem, "quantity">;
  saved: boolean;
  signedIn: boolean;
}) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();
  const soldOut = product.stock <= 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {!soldOut && <Qty value={qty} max={product.stock} onChange={(n) => setQty(Math.max(1, n))} />}
        <button disabled={soldOut} onClick={() => add(product, qty)} className="btn btn-dark flex-1">
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
  );
}
