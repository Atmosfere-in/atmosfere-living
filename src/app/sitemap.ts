import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://atmosfere-living.in").replace(/\/$/, "");

export const revalidate = 3600;

/** Every public page Google should index: home, shop, categories, products and policies. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const now = new Date();

  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({
      url: `${SITE}/shop?category=${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${SITE}/products/${p.slug}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "weekly" as const,
      priority: p.is_demo ? 0.3 : 0.8,
    })),
    ...["shipping", "returns", "terms", "privacy"].map((slug) => ({
      url: `${SITE}/policies/${slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
