"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cartLineId } from "@/lib/utils";

export interface CartItem {
  /** Unique per product + chosen variations. */
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
  /** Chosen variations, e.g. { Polish: "Walnut" }. */
  options?: Record<string, string>;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  ready: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<CartItem, "quantity" | "lineId">, qty?: number) => void;
  update: (lineId: string, qty: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "atmosfere-living-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems((JSON.parse(raw) as CartItem[]).map((i) => ({ ...i, lineId: i.lineId ?? cartLineId(i.productId, i.options) })));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback<CartCtx["add"]>((item, qty = 1) => {
    const lineId = cartLineId(item.productId, item.options);
    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === lineId);
      if (existing) {
        return prev.map((i) => (i.lineId === lineId ? { ...i, ...item, quantity: Math.min(i.quantity + qty, item.stock) } : i));
      }
      return [...prev, { ...item, lineId, quantity: Math.min(qty, item.stock) }];
    });
    setOpen(true);
  }, []);

  const update = useCallback((lineId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.lineId === lineId ? { ...i, quantity: Math.max(0, Math.min(qty, i.stock)) } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const remove = useCallback((lineId: string) => setItems((p) => p.filter((i) => i.lineId !== lineId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.price * i.quantity, 0),
      open,
      ready,
      setOpen,
      add,
      update,
      remove,
      clear,
    }),
    [items, open, ready, add, update, remove, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
