"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Crosshair, ImagePlus, Plus, X } from "lucide-react";
import { saveCorner } from "@/lib/actions/admin";
import { uploadImages } from "@/lib/upload";
import { OptionPicker } from "@/components/store/OptionPicker";
import { cx, img, initialChoices, slugify } from "@/lib/utils";
import type { Product, VibeCorner } from "@/lib/types";

type PickProduct = Pick<Product, "id" | "name" | "images" | "options" | "is_demo" | "is_active">;
type Row = { key: string; product_id: string; x: number; y: number; default_options: Record<string, string> };

let keySeq = 0;
const newKey = () => `row-${++keySeq}`;

/** Create / edit a Shop by Vibe corner: details, image, and the products placed on it as dots. */
export function CornerForm({ corner, products }: { corner?: VibeCorner; products: PickProduct[] }) {
  const router = useRouter();
  const [name, setName] = useState(corner?.name ?? "");
  const [slug, setSlug] = useState(corner?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!corner);
  const [tagline, setTagline] = useState(corner?.tagline ?? "");
  const [story, setStory] = useState(corner?.story ?? "");
  const [image, setImage] = useState(corner?.image ?? "");
  const [sortOrder, setSortOrder] = useState(corner?.sort_order ?? 0);
  const [active, setActive] = useState(corner?.is_active ?? true);
  const [rows, setRows] = useState<Row[]>(() =>
    (corner?.items ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((it) => ({ key: newKey(), product_id: it.product_id, x: Number(it.x), y: Number(it.y), default_options: it.default_options ?? {} })),
  );
  const [placing, setPlacing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const byId = new Map(products.map((p) => [p.id, p]));
  const setRow = (key: string, patch: Partial<Row>) => setRows((all) => all.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const { urls, error } = await uploadImages([files[0]], `vibes-${name || "corner"}`);
    if (error) setError(error);
    if (urls[0]) setImage(urls[0]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const placeDot = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placing) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 1000) / 10;
    const y = Math.round(((e.clientY - r.top) / r.height) * 1000) / 10;
    setRow(placing, { x, y });
    setPlacing(null);
  };

  const addRow = () => {
    const key = newKey();
    setRows((all) => [...all, { key, product_id: "", x: 50, y: 50, default_options: {} }]);
    setPlacing(key);
  };

  const save = () =>
    start(async () => {
      setError(null);
      const r = await saveCorner({
        id: corner?.id,
        name,
        slug,
        tagline,
        story,
        image,
        sort_order: sortOrder,
        is_active: active,
        items: rows.filter((r) => r.product_id).map(({ product_id, x, y, default_options }) => ({ product_id, x, y, default_options })),
      });
      if (!r.ok) return setError(r.error);
      router.push("/admin/vibes?saved=1");
      router.refresh();
    });

  return (
    <div className="grid gap-8 xl:grid-cols-3">
      <div className="space-y-8 xl:col-span-2">
        <section className="card space-y-5 p-6">
          <h2 className="text-[0.7rem] font-medium tracking-[0.2em] uppercase">Details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label">Vibe name *</label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. Bohemian"
                className="field"
              />
            </div>
            <div>
              <label className="label">URL slug</label>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                className="field"
              />
            </div>
          </div>
          <div>
            <label className="label">Tagline</label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Earthy, layered and sun-warmed." className="field" maxLength={120} />
          </div>
          <div>
            <label className="label">Story</label>
            <textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="Two or three lines about the mood of this corner." className="field !min-h-28" />
          </div>
        </section>

        <section className="card space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[0.7rem] font-medium tracking-[0.2em] uppercase">Corner image & pieces</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-outline !min-h-9 bg-white">
                <ImagePlus size={14} /> {uploading ? "Uploading…" : image ? "Replace image" : "Upload image"}
              </button>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files)} />
          <input value={image} onChange={(e) => setImage(e.target.value.trim())} placeholder="…or paste an image URL" className="field !min-h-10 text-sm" />

          {image ? (
            <>
              <p className={cx("rounded-sm px-4 py-2.5 text-xs", placing ? "bg-accent/10 text-accent" : "bg-stone-100 text-stone-600")}>
                {placing ? "Click on the image where this piece is." : "Add a piece, then click on the image to place its dot. Use “Place” to move a dot."}
              </p>
              <div onClick={placeDot} className={cx("relative overflow-hidden rounded-md bg-stone-100 select-none", placing && "cursor-crosshair")}>
                {/* eslint-disable-next-line @next/next/no-img-element -- plain img so clicks map exactly to the image */}
                <img src={img(image, 1600)} alt="" className="block w-full" draggable={false} />
                {rows.map((r, i) => (
                  <span
                    key={r.key}
                    className={cx(
                      "absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[0.65rem] font-medium shadow",
                      placing === r.key ? "border-accent bg-accent text-white" : "border-white bg-white/90 text-ink",
                    )}
                    style={{ left: `${r.x}%`, top: `${r.y}%` }}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="rounded-md border border-dashed border-stone-400 px-6 py-12 text-center text-sm text-stone-600">Upload the styled corner image to start placing pieces.</p>
          )}

          <ul className="space-y-3">
            {rows.map((r, i) => {
              const p = byId.get(r.product_id);
              return (
                <li key={r.key} className={cx("rounded-md border p-4", placing === r.key ? "border-accent" : "border-stone-200")}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-stone-100 text-[0.65rem] font-medium">{i + 1}</span>
                    {p?.images[0] && (
                      <span className="relative h-10 w-9 shrink-0 overflow-hidden rounded bg-stone-100">
                        <Image src={img(p.images[0], 120)} alt="" fill sizes="36px" className="object-cover" />
                      </span>
                    )}
                    <select
                      value={r.product_id}
                      onChange={(e) => {
                        const np = byId.get(e.target.value);
                        setRow(r.key, { product_id: e.target.value, default_options: initialChoices(np?.options) });
                      }}
                      className="field !min-h-10 min-w-0 flex-1"
                    >
                      <option value="">Choose a product…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                          {p.is_demo ? " (demo)" : ""}
                          {!p.is_active ? " (hidden)" : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setPlacing((k) => (k === r.key ? null : r.key))}
                      disabled={!image}
                      className={cx("btn !min-h-10 !px-3", placing === r.key ? "btn-dark" : "btn-outline bg-white")}
                    >
                      <Crosshair size={14} /> Place
                    </button>
                    <button
                      type="button"
                      aria-label="Remove piece"
                      onClick={() => setRows((all) => all.filter((x) => x.key !== r.key))}
                      className="grid h-10 w-10 place-items-center rounded text-stone-400 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {p && (p.options?.length ?? 0) > 0 && (
                    <div className="mt-4 border-t border-stone-200 pt-4">
                      <p className="mb-3 text-xs text-stone-400">Variation shown in the image (pre-selected for customers)</p>
                      <OptionPicker
                        compact
                        options={p.options}
                        chosen={initialChoices(p.options, r.default_options)}
                        onChange={(n, v) => setRow(r.key, { default_options: { ...initialChoices(p.options, r.default_options), [n]: v } })}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={addRow} disabled={!image} className="btn btn-outline w-full bg-white">
            <Plus size={14} /> Add piece
          </button>
        </section>
      </div>

      <div className="space-y-8">
        <section className="card space-y-5 p-6">
          <h2 className="text-[0.7rem] font-medium tracking-[0.2em] uppercase">Publish</h2>
          <div>
            <label className="label">Display order</label>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="field" />
            <p className="mt-1 text-xs text-stone-400">Lower numbers show first.</p>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[var(--color-accent)]" />
            Visible in store
          </label>
        </section>

        {error && <p className="rounded-sm bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        <div className="flex gap-3">
          <button onClick={save} disabled={pending || uploading} className="btn btn-dark flex-1">
            {pending ? "Saving…" : corner ? "Save changes" : "Create corner"}
          </button>
          <Link href="/admin/vibes" className="btn btn-outline bg-white">
            Cancel
          </Link>
        </div>
        {corner && (
          <Link href={`/vibes/${corner.slug}`} target="_blank" className="block text-center text-xs underline text-stone-600">
            View in store ↗
          </Link>
        )}
      </div>
    </div>
  );
}
