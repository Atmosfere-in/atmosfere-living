import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getProducts, getRatings, type SortKey } from "@/lib/data";
import { ProductCard } from "@/components/store/ProductCard";
import { SortSelect } from "@/components/store/SortSelect";
import { cx } from "@/lib/utils";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: SortKey; q?: string }>;
}) {
  const { category, sort, q } = await searchParams;
  const [categories, products, ratings] = await Promise.all([
    getCategories(),
    getProducts({ category, sort, q }),
    getRatings(),
  ]);
  const active = categories.find((c) => c.slug === category);

  const href = (slug?: string) => {
    const p = new URLSearchParams();
    if (slug) p.set("category", slug);
    if (sort) p.set("sort", sort);
    return `/shop${p.toString() ? `?${p}` : ""}`;
  };

  return (
    <div className="container-lux pb-28 pt-16 md:pt-24">
      <p className="eyebrow">{q ? "Search" : active ? "Category" : "The collection"}</p>
      <h1 className="display mt-4 text-[clamp(2.5rem,5vw,4.5rem)]">{q ? `“${q}”` : active?.name ?? "Shop all"}</h1>
      <p className="mt-4 max-w-xl text-stone-600 font-light">
        {active?.description ?? "Furniture, lighting, textiles and objects — curated by the Atmosfere design studio."}
      </p>

      <div className="mt-12 flex flex-col gap-6 border-y border-stone-200 py-5 md:flex-row md:items-center md:justify-between">
        <nav className="-mx-1 flex gap-2 overflow-x-auto pb-1 md:pb-0" aria-label="Categories">
          <Pill href={href()} active={!category}>
            All
          </Pill>
          {categories.map((c) => (
            <Pill key={c.id} href={href(c.slug)} active={category === c.slug}>
              {c.name}
            </Pill>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-6 md:justify-end">
          <span className="text-xs tracking-[0.18em] uppercase text-stone-600">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </span>
          <SortSelect value={sort ?? "new"} />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-32 text-center">
          <p className="display text-3xl">Nothing here yet.</p>
          <Link href="/shop" className="link-underline mt-8">
            View all pieces
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} rating={ratings[p.id]} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cx(
        "shrink-0 rounded-full border px-5 py-2 text-[0.68rem] font-medium tracking-[0.18em] uppercase transition-colors",
        active ? "border-charcoal bg-charcoal text-ivory" : "border-stone-200 hover:border-ink",
      )}
    >
      {children}
    </Link>
  );
}
