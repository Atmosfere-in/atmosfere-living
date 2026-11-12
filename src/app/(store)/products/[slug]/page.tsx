import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedReviews, getProductBySlug, getRelated } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/ProductCard";
import { Gallery } from "@/components/store/Gallery";
import { AddToCart } from "@/components/store/AddToCart";
import { ReviewForm } from "@/components/store/ReviewForm";
import { Stars } from "@/components/store/Stars";
import { fmtDate, img, inr } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Not found" };
  return {
    title: p.name,
    description: p.short_description ?? undefined,
    openGraph: { images: p.images[0] ? [img(p.images[0], 1200)] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.is_active) notFound();

  const [reviews, related, { user }] = await Promise.all([getApprovedReviews(product.id), getRelated(product), getSession()]);

  let saved = false;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase.from("wishlist").select("product_id").eq("user_id", user.id).eq("product_id", product.id).maybeSingle();
    saved = !!data;
  }

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const onSale = product.compare_at_price && product.compare_at_price > product.price;

  const details = [
    ["Materials", product.materials],
    ["Dimensions", product.dimensions],
    ["Care", product.care],
    ["Delivery", "Ships in 5–10 working days. Large furniture is delivered and placed by our white-glove team."],
    ["Returns", "Eligible pieces can be returned within 14 days of delivery in their original condition."],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <>
      <div className="container-lux pt-8 md:pt-12">
        <nav className="text-xs tracking-[0.14em] uppercase text-stone-400" aria-label="Breadcrumb">
          <Link href="/shop" className="hover:text-ink">
            Shop
          </Link>
          {product.category && (
            <>
              {" / "}
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-ink">
                {product.category.name}
              </Link>
            </>
          )}
        </nav>
      </div>

      <section className="container-lux grid gap-10 pb-24 pt-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Gallery images={product.images} name={product.name} />
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-[calc(var(--header-height)+24px)] lg:self-start">
          {product.category && <p className="eyebrow">{product.category.name}</p>}
          <h1 className="display mt-4 text-[clamp(2.25rem,3.6vw,3.25rem)]">{product.name}</h1>
          {reviews.length > 0 && (
            <a href="#reviews" className="mt-3 flex items-center gap-2 text-sm text-stone-600">
              <Stars value={avg} /> {avg.toFixed(1)} · {reviews.length} review{reviews.length > 1 ? "s" : ""}
            </a>
          )}
          <div className="mt-6 flex items-baseline gap-4">
            <span className="font-display text-3xl">{inr(product.price)}</span>
            {onSale && (
              <>
                <span className="text-stone-400 line-through">{inr(product.compare_at_price)}</span>
                <span className="badge text-accent">Save {Math.round((1 - product.price / product.compare_at_price!) * 100)}%</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-stone-400">Inclusive of all taxes</p>

          <p className="mt-8 text-stone-600 font-light leading-relaxed">{product.description ?? product.short_description}</p>

          <div className="mt-10">
            <AddToCart
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: Number(product.price),
                image: product.images[0] ?? null,
                stock: product.stock,
              }}
              saved={saved}
              signedIn={!!user}
            />
          </div>

          <dl className="mt-12 divide-y divide-stone-200 border-y border-stone-200">
            {details.map(([k, v]) => (
              <details key={k} className="group py-5" open={k === "Materials"}>
                <summary className="flex cursor-pointer list-none items-center justify-between text-[0.7rem] font-medium tracking-[0.2em] uppercase">
                  {k}
                  <span className="text-lg font-light transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <dd className="pt-3 text-sm text-stone-600 font-light leading-relaxed">{v}</dd>
              </details>
            ))}
          </dl>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="border-t border-stone-200 bg-stone-100/50">
        <div className="container-lux grid gap-14 py-24 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Reviews</p>
            <h2 className="display mt-4 text-4xl">{reviews.length ? `${avg.toFixed(1)} out of 5` : "No reviews yet"}</h2>
            {reviews.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-stone-600">
                <Stars value={avg} /> Based on {reviews.length} review{reviews.length > 1 ? "s" : ""}
              </div>
            )}
            <div className="mt-10">
              <ReviewForm productId={product.id} slug={product.slug} signedIn={!!user} />
            </div>
          </div>
          <ul className="space-y-10 lg:col-span-7 lg:col-start-6">
            {reviews.length === 0 && <li className="text-stone-600 font-light">Be the first to share how this piece lives in your home.</li>}
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-stone-200 pb-10">
                <div className="flex items-center justify-between">
                  <Stars value={r.rating} />
                  <span className="text-xs text-stone-400">{fmtDate(r.created_at)}</span>
                </div>
                {r.title && <h3 className="mt-4 font-display text-xl">{r.title}</h3>}
                <p className="mt-2 text-stone-600 font-light leading-relaxed">{r.body}</p>
                <p className="mt-4 text-xs tracking-[0.18em] uppercase text-stone-400">{r.author_name ?? "Customer"} · Verified</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-lux py-24">
          <p className="eyebrow">Style it with</p>
          <h2 className="display mt-4 text-4xl">You may also like</h2>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
