import "server-only";
import { createClient } from "./supabase/server";
import { demoCategories, demoProducts } from "./demo-data";
import { isSupabaseConfigured } from "./utils";
import type { Category, Product, Review } from "./types";

const PRODUCT_SELECT = "*, category:categories(name, slug)";

export type SortKey = "new" | "price-asc" | "price-desc" | "name";

type ProductQuery = { category?: string; q?: string; sort?: SortKey; featured?: boolean; limit?: number };

/**
 * When the database can't be reached (keys missing, project paused, network down) the
 * storefront falls back to the demo catalogue so pages still render. Checkout still needs
 * the real database, so orders can't be placed against demo products.
 */
/**
 * CATALOG_SOURCE=demo keeps the storefront on the demo catalogue even when Supabase is connected,
 * so backend work (auth, orders, admin) can continue while real products are being prepared.
 * Set it to "database" (or remove it) to show products from Supabase.
 */
const isDemoCatalog = () => !isSupabaseConfigured() || process.env.CATALOG_SOURCE === "demo";

function dbDown(error: unknown, where: string) {
  console.error(`[data] Supabase unavailable in ${where}; showing demo catalogue.`, error);
}

function demoQuery(opts: ProductQuery): Product[] {
  let list = [...demoProducts];
  if (opts.category) list = list.filter((p) => p.category?.slug === opts.category);
  if (opts.featured) list = list.filter((p) => p.is_featured);
  if (opts.q) {
    const q = opts.q.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.short_description?.toLowerCase().includes(q));
  }
  list.sort(sorter(opts.sort));
  return opts.limit ? list.slice(0, opts.limit) : list;
}

export async function getCategories(): Promise<Category[]> {
  if (isDemoCatalog()) return demoCategories;
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) {
    dbDown(error, "getCategories");
    return demoCategories;
  }
  return data ?? [];
}

export async function getProducts(opts: ProductQuery = {}): Promise<Product[]> {
  if (isDemoCatalog()) return demoQuery(opts);

  const supabase = await createClient();
  let query = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true);

  if (opts.category) {
    const { data: cat, error } = await supabase.from("categories").select("id").eq("slug", opts.category).maybeSingle();
    if (error) {
      dbDown(error, "getProducts/category");
      return demoQuery(opts);
    }
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }
  if (opts.featured) query = query.eq("is_featured", true);
  if (opts.q) {
    const q = opts.q.replace(/[%,()]/g, "");
    query = query.or(`name.ilike.%${q}%,short_description.ilike.%${q}%`);
  }

  switch (opts.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
      query = query.order("name");
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }
  if (opts.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) {
    dbDown(error, "getProducts");
    return demoQuery(opts);
  }
  return (data as Product[]) ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isDemoCatalog()) return demoProducts.find((p) => p.slug === slug) ?? null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  if (error) {
    dbDown(error, "getProductBySlug");
    return demoProducts.find((p) => p.slug === slug) ?? null;
  }
  return (data as Product) ?? null;
}

export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  if (!product.category?.slug) return [];
  const list = await getProducts({ category: product.category.slug, limit: limit + 1 });
  return list.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function getApprovedReviews(productId: string): Promise<Review[]> {
  if (isDemoCatalog()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getRatings(): Promise<Record<string, { avg: number; count: number }>> {
  if (isDemoCatalog()) return {};
  const supabase = await createClient();
  const { data, error } = await supabase.from("product_ratings").select("*");
  if (error) return {};
  return Object.fromEntries((data ?? []).map((r) => [r.product_id, { avg: Number(r.avg_rating), count: r.review_count }]));
}

function sorter(sort?: SortKey) {
  return (a: Product, b: Product) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return +new Date(b.created_at) - +new Date(a.created_at);
    }
  };
}
