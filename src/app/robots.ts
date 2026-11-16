import type { MetadataRoute } from "next";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://atmosfere-living.in").replace(/\/$/, "");

/** Lets search engines crawl the store, keeps private and transactional pages out. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/checkout", "/cart", "/login", "/auth"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
