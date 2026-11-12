"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ImagePlus, X } from "lucide-react";
import { saveProduct } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/client";
import { img, slugify } from "@/lib/utils";
import type { Category, Product } from "@/lib/types";

export function ProductForm({ product, categories }: { product?: Product; categories: Pick<Category, "id" | "name">[] }) {
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 8 * 1024 * 1024) {
        setError(`${file.name} is larger than 8 MB.`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${slugify(name || "product")}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) {
        setError(error.message);
        continue;
      }
      uploaded.push(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
    setImages((i) => [...i, ...uploaded]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const move = (i: number, d: number) =>
    setImages((arr) => {
      const next = [...arr];
      const j = i + d;
      if (j < 0 || j >= next.length) return arr;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <form
      action={(fd) =>
        start(async () => {
          setError(null);
          const r = await saveProduct(fd);
          if (r && !r.ok) setError(r.error);
        })
      }
      className="grid gap-8 xl:grid-cols-3"
    >
      {product && <input type="hidden" name="id" value={product.id} />}
      {images.map((src) => (
        <input key={src} type="hidden" name="images" value={src} />
      ))}

      <div className="space-y-8 xl:col-span-2">
        <section className="card space-y-5 p-6">
          <h2 className="text-[0.7rem] font-medium tracking-[0.2em] uppercase">Details</h2>
          <div>
            <label className="label">Name *</label>
            <input
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className="field"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label">URL slug</label>
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                className="field"
              />
            </div>
            <div>
              <label className="label">SKU</label>
              <input name="sku" defaultValue={product?.sku ?? ""} className="field" />
            </div>
          </div>
          <div>
            <label className="label">Short description</label>
            <input name="short_description" defaultValue={product?.short_description ?? ""} className="field" maxLength={160} />
          </div>
          <div>
            <label className="label">Full description</label>
            <textarea name="description" defaultValue={product?.description ?? ""} className="field !min-h-40" />
          </div>
        </section>

        <section className="card space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.7rem] font-medium tracking-[0.2em] uppercase">Images</h2>
            <span className="text-xs text-stone-400">First image is the cover</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {images.map((src, i) => (
              <div key={src} className="group relative aspect-[4/5] overflow-hidden rounded-md bg-stone-100">
                <Image src={img(src, 300)} alt="" fill sizes="150px" className="object-cover" />
                {i === 0 && <span className="badge absolute left-1.5 top-1.5 bg-white/90 !text-[0.55rem]">Cover</span>}
                <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex gap-1">
                    <IconBtn onClick={() => move(i, -1)} label="Move left">
                      <ArrowUp size={12} className="-rotate-90" />
                    </IconBtn>
                    <IconBtn onClick={() => move(i, 1)} label="Move right">
                      <ArrowDown size={12} className="-rotate-90" />
                    </IconBtn>
                  </span>
                  <IconBtn onClick={() => setImages((a) => a.filter((x) => x !== src))} label="Remove">
                    <X size={12} />
                  </IconBtn>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="grid aspect-[4/5] place-items-center rounded-md border border-dashed border-stone-400 text-stone-600 hover:border-ink cursor-pointer"
            >
              <span className="flex flex-col items-center gap-2 text-xs">
                <ImagePlus size={20} strokeWidth={1.4} />
                {uploading ? "Uploading…" : "Upload"}
              </span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          <div className="flex gap-2">
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image URL" className="field !min-h-10" />
            <button
              type="button"
              onClick={() => {
                if (url.startsWith("http")) setImages((a) => [...a, url.trim()]);
                setUrl("");
              }}
              className="btn btn-outline !min-h-10"
            >
              Add
            </button>
          </div>
        </section>

        <section className="card grid gap-5 p-6 sm:grid-cols-3">
          <h2 className="text-[0.7rem] font-medium tracking-[0.2em] uppercase sm:col-span-3">Specifications</h2>
          <div>
            <label className="label">Materials</label>
            <input name="materials" defaultValue={product?.materials ?? ""} className="field" />
          </div>
          <div>
            <label className="label">Dimensions</label>
            <input name="dimensions" defaultValue={product?.dimensions ?? ""} className="field" />
          </div>
          <div>
            <label className="label">Care</label>
            <input name="care" defaultValue={product?.care ?? ""} className="field" />
          </div>
        </section>
      </div>

      <div className="space-y-8">
        <section className="card space-y-5 p-6">
          <h2 className="text-[0.7rem] font-medium tracking-[0.2em] uppercase">Pricing & stock</h2>
          <div>
            <label className="label">Price (₹) *</label>
            <input name="price" type="number" min="0" step="1" required defaultValue={product?.price ?? ""} className="field" />
          </div>
          <div>
            <label className="label">Compare-at price (₹)</label>
            <input name="compare_at_price" type="number" min="0" step="1" defaultValue={product?.compare_at_price ?? ""} className="field" />
            <p className="mt-1 text-xs text-stone-400">Shows as a struck-through “was” price.</p>
          </div>
          <div>
            <label className="label">Stock</label>
            <input name="stock" type="number" min="0" step="1" defaultValue={product?.stock ?? 0} className="field" />
          </div>
        </section>

        <section className="card space-y-5 p-6">
          <h2 className="text-[0.7rem] font-medium tracking-[0.2em] uppercase">Organisation</h2>
          <div>
            <label className="label">Category</label>
            <select name="category_id" defaultValue={product?.category_id ?? ""} className="field">
              <option value="">Uncategorised</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} className="accent-[var(--color-accent)]" />
            Visible in store
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} className="accent-[var(--color-accent)]" />
            Feature on homepage
          </label>
        </section>

        {error && <p className="rounded-sm bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        <div className="flex gap-3">
          <button disabled={pending || uploading} className="btn btn-dark flex-1">
            {pending ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
          <Link href="/admin/products" className="btn btn-outline bg-white">
            Cancel
          </Link>
        </div>
        {product && (
          <Link href={`/products/${product.slug}`} target="_blank" className="block text-center text-xs underline text-stone-600">
            View in store ↗
          </Link>
        )}
      </div>
    </form>
  );
}

function IconBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="grid h-6 w-6 place-items-center rounded bg-white/95 shadow-sm cursor-pointer">
      {children}
    </button>
  );
}
