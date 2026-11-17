"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Plus, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { OptionPicker } from "@/components/store/OptionPicker";
import { cx, img, initialChoices, inr, priceWithOptions } from "@/lib/utils";
import type { VibeCorner, VibeCornerItem } from "@/lib/types";

type Choices = Record<string, Record<string, string>>;

const canBuy = (it: VibeCornerItem) => !!it.product && !it.product.is_coming_soon && it.product.stock > 0;
const unitPrice = (it: VibeCornerItem, chosen: Record<string, string>) => priceWithOptions(it.product!.price, it.product!.options, chosen);

/** The corner image with shoppable dots, the list of its pieces, and a sticky "shop the corner" bar. */
export function CornerShop({ corner }: { corner: VibeCorner }) {
  const items = useMemo(() => corner.items ?? [], [corner.items]);
  const { add } = useCart();
  const [choices, setChoices] = useState<Choices>(() =>
    Object.fromEntries(items.map((it) => [it.id, initialChoices(it.product?.options, it.default_options)])),
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set(items.filter(canBuy).map((it) => it.id)));
  const [active, setActive] = useState<string | null>(null);
  const [touch, setTouch] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const on = () => setTouch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const choose = (id: string, name: string, value: string) => setChoices((c) => ({ ...c, [id]: { ...c[id], [name]: value } }));
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const buyable = items.filter(canBuy);
  const chosenItems = buyable.filter((it) => selected.has(it.id));
  const total = chosenItems.reduce((sum, it) => sum + unitPrice(it, choices[it.id]), 0);
  const wholeTotal = buyable.reduce((sum, it) => sum + unitPrice(it, choices[it.id]), 0);

  const addItems = (list: VibeCornerItem[]) => {
    for (const it of list) {
      const p = it.product!;
      add({ productId: p.id, slug: p.slug, name: p.name, price: unitPrice(it, choices[it.id]), image: p.images[0] ?? null, stock: p.stock, options: choices[it.id] }, 1);
    }
    const skipped = items.length - buyable.length;
    setNotice(`${list.length} piece${list.length === 1 ? "" : "s"} added to your bag${skipped && list.length > 1 ? ` · ${skipped} not available right now` : ""}.`);
  };

  // Desktop hover: keep the card open while the pointer moves from the dot onto it.
  const openCard = (id: string) => {
    if (touch) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(id);
  };
  const closeCard = () => {
    if (touch) return;
    closeTimer.current = setTimeout(() => setActive(null), 180);
  };

  const activeItem = items.find((it) => it.id === active);

  return (
    <div>
      <section className="container-lux grid grid-cols-1 gap-10 pb-16 pt-8 md:pt-12 lg:grid-cols-12 lg:gap-14">
        {/* Image with dots */}
        <div className="lg:col-span-8">
          <div className="relative aspect-[1246/1120] overflow-visible">
            <div className="absolute inset-0 overflow-hidden rounded-[18px] bg-stone-100">
              <Image src={img(corner.image, 2400)} alt={`${corner.name} corner styled with Atmosfere Living pieces`} fill priority sizes="(min-width:1024px) 62vw, 100vw" className="object-cover" />
            </div>

            {items.map((it, n) => (
              <div key={it.id} className="absolute" style={{ left: `${it.x}%`, top: `${it.y}%` }} onMouseEnter={() => openCard(it.id)} onMouseLeave={closeCard}>
                <button
                  type="button"
                  aria-label={`${it.product!.name} — view details`}
                  aria-expanded={active === it.id}
                  onClick={() => setActive((a) => (a === it.id ? null : it.id))}
                  className="hotspot"
                  style={{ animationDelay: `${n * 0.4}s` }}
                  data-active={active === it.id}
                >
                  <span />
                </button>

                {!touch && active === it.id && (
                  <div
                    className={cx("absolute z-20 w-[300px] pt-1", it.x < 55 ? "left-6" : "right-6")}
                    style={{ top: 0, transform: `translateY(-${Math.min(85, Math.max(10, it.y))}%)` }}
                  >
                    <ItemCard item={it} chosen={choices[it.id]} onChoose={(name, value) => choose(it.id, name, value)} onAdd={() => addItems([it])} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-stone-400">{touch ? "Tap" : "Hover over"} the dots to explore each piece.</p>
        </div>

        {/* Story + whole-corner purchase */}
        <aside className="lg:col-span-4 lg:sticky lg:top-[calc(var(--header-height)+24px)] lg:self-start">
          <Link href="/vibes" className="eyebrow hover:underline">
            Shop by Vibe
          </Link>
          <h1 className="display mt-4 text-[clamp(2.5rem,4.5vw,4rem)]">{corner.name}</h1>
          {corner.tagline && <p className="mt-3 font-display text-xl text-stone-600">{corner.tagline}</p>}
          {corner.story && <p className="mt-6 text-stone-600 font-light leading-relaxed">{corner.story}</p>}

          <div className="mt-10 border-t border-stone-200 pt-8">
            <div className="flex items-baseline justify-between">
              <span className="text-[0.7rem] font-medium tracking-[0.2em] uppercase">The complete corner</span>
              <span className="text-sm text-stone-600">
                {buyable.length} piece{buyable.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="mt-3 font-display text-3xl">{inr(wholeTotal)}</p>
            <button disabled={!buyable.length} onClick={() => addItems(buyable)} className="btn btn-dark mt-6 w-full">
              Shop the entire corner <ArrowRight size={14} />
            </button>
            <a href="#pieces" className="mt-4 block text-center text-xs tracking-[0.18em] uppercase text-stone-600 hover:text-ink">
              Or choose pieces ↓
            </a>
          </div>
        </aside>
      </section>

      {/* Pieces list */}
      <section id="pieces" className="container-lux scroll-mt-28 pb-16">
        <p className="eyebrow">In this corner</p>
        <h2 className="display mt-4 text-[clamp(2rem,3.5vw,3rem)]">Shop the pieces</h2>
        <ul className="mt-10 divide-y divide-stone-200 border-y border-stone-200">
          {items.map((it) => {
            const p = it.product!;
            const ok = canBuy(it);
            const on = ok && selected.has(it.id);
            return (
              <li key={it.id} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-4 py-6 sm:grid-cols-[auto_auto_1fr_auto] sm:items-center sm:gap-x-6">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  aria-label={`Include ${p.name}`}
                  disabled={!ok}
                  onClick={() => toggle(it.id)}
                  className={cx(
                    "row-span-2 grid h-6 w-6 place-items-center self-center rounded-full border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 sm:row-span-1",
                    on ? "border-ink bg-ink text-ivory" : "border-stone-400",
                  )}
                >
                  {on && <Check size={13} strokeWidth={2} />}
                </button>
                <Link href={`/products/${p.slug}`} className="flex items-center gap-4 sm:contents">
                  <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100 sm:h-28 sm:w-24">
                    <Image src={img(p.images[0], 400)} alt={p.name} fill sizes="96px" className="object-cover" />
                  </span>
                  <span className="sm:hidden">
                    <span className="block text-[0.6rem] tracking-[0.22em] uppercase text-stone-400">{p.category?.name}</span>
                    <span className="block font-display text-lg leading-snug">{p.name}</span>
                  </span>
                </Link>
                <div className="col-start-2 space-y-3 sm:col-start-auto">
                  <Link href={`/products/${p.slug}`} className="hidden sm:block">
                    <span className="block text-[0.6rem] tracking-[0.22em] uppercase text-stone-400">{p.category?.name}</span>
                    <span className="block font-display text-xl leading-snug hover:underline">{p.name}</span>
                  </Link>
                  <OptionPicker compact options={p.options} chosen={choices[it.id]} onChange={(name, value) => choose(it.id, name, value)} />
                </div>
                <div className="col-start-2 flex items-center justify-between gap-4 sm:col-start-auto sm:flex-col sm:items-end">
                  <span className="font-display text-lg">{p.is_coming_soon ? "Coming soon" : inr(unitPrice(it, choices[it.id]))}</span>
                  {ok ? (
                    <button onClick={() => addItems([it])} className="inline-flex items-center gap-1 text-xs tracking-[0.18em] uppercase underline-offset-4 hover:underline cursor-pointer">
                      <Plus size={12} /> Add
                    </button>
                  ) : (
                    <span className="text-xs text-stone-400">{p.is_coming_soon ? "Not yet available" : "Sold out"}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Shop bar: sticks to the bottom of the screen until the footer */}
      <div className="sticky bottom-0 z-30 border-t border-stone-200 bg-ivory/95 backdrop-blur-md">
        <div className="container-lux flex items-center justify-between gap-3 py-3 sm:py-4">
          <div className="min-w-0">
            <p className="truncate text-[0.6rem] tracking-[0.22em] uppercase text-stone-400">
              {notice ?? `${chosenItems.length} of ${buyable.length} pieces`}
            </p>
            <p className="font-display text-xl">{inr(total)}</p>
          </div>
          {/* Phone: one button that adapts to the selection */}
          <button
            disabled={!chosenItems.length}
            onClick={() => addItems(chosenItems)}
            className="btn btn-dark !min-h-11 shrink-0 !px-5 sm:hidden"
          >
            {chosenItems.length === buyable.length ? "Add corner" : `Add ${chosenItems.length} piece${chosenItems.length === 1 ? "" : "s"}`}
          </button>
          <div className="hidden gap-2 sm:flex">
            <button disabled={!chosenItems.length} onClick={() => addItems(chosenItems)} className="btn btn-outline !min-h-11 !px-6">
              Add selected
            </button>
            <button disabled={!buyable.length} onClick={() => addItems(buyable)} className="btn btn-dark !min-h-11 !px-6">
              Shop the entire corner
            </button>
          </div>
        </div>
      </div>

      {/* Phone: piece details as a bottom sheet */}
      {touch && activeItem && (
        <div className="fixed inset-0 z-50" role="dialog" aria-label={activeItem.product!.name}>
          <button aria-label="Close" onClick={() => setActive(null)} className="absolute inset-0 bg-stone-600/25 backdrop-blur-[2px]" />
          <div className="sheet-up absolute inset-x-0 bottom-0 max-h-[80svh] overflow-y-auto rounded-t-[22px] bg-ivory px-5 pb-8 pt-3">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone-200" />
            <button aria-label="Close" onClick={() => setActive(null)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full cursor-pointer">
              <X size={18} strokeWidth={1.4} />
            </button>
            <ItemCard
              item={activeItem}
              chosen={choices[activeItem.id]}
              onChoose={(name, value) => choose(activeItem.id, name, value)}
              onAdd={() => {
                addItems([activeItem]);
                setActive(null);
              }}
              flat
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** Product preview shown from a dot: photo, price, swatches, link to the product page, add to bag. */
function ItemCard({
  item,
  chosen,
  onChoose,
  onAdd,
  flat = false,
}: {
  item: VibeCornerItem;
  chosen: Record<string, string>;
  onChoose: (name: string, value: string) => void;
  onAdd: () => void;
  flat?: boolean;
}) {
  const p = item.product!;
  const ok = canBuy(item);
  return (
    <div className={cx(flat ? "" : "card-pop rounded-[16px] border border-stone-200 bg-ivory p-5 shadow-[0_18px_50px_-20px_rgba(43,40,37,0.35)]")}>
      <Link href={`/products/${p.slug}`} className="group flex gap-4">
        <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
          <Image src={img(p.images[0], 400)} alt={p.name} fill sizes="80px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        </span>
        <span className="min-w-0 self-center">
          {p.category && <span className="block text-[0.6rem] tracking-[0.24em] uppercase text-stone-400">{p.category.name}</span>}
          <span className="mt-1 block font-display text-lg leading-snug group-hover:underline">{p.name}</span>
          <span className="mt-1 block text-sm">{p.is_coming_soon ? "Coming soon" : inr(unitPrice(item, chosen))}</span>
        </span>
      </Link>
      {(p.options?.length ?? 0) > 0 && (
        <div className="mt-4 border-t border-stone-200 pt-4">
          <OptionPicker compact options={p.options} chosen={chosen} onChange={onChoose} />
        </div>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
        <Link href={`/products/${p.slug}`} className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.2em] uppercase hover:underline underline-offset-4">
          View piece <ArrowRight size={12} />
        </Link>
        {ok ? (
          <button onClick={onAdd} className="btn btn-dark !min-h-9 !px-4 !text-[0.62rem]">
            <Plus size={12} /> Add
          </button>
        ) : (
          <span className="text-xs text-stone-400">{p.is_coming_soon ? "Not yet available" : "Sold out"}</span>
        )}
      </div>
    </div>
  );
}
