/**
 * Coming soon gate.
 *
 * Visitors arriving on these domains (atmosfereliving.in, no hyphen) see only the coming soon page — every path, including shop,
 * products, cart, login and admin. The Vercel address (atmosfere-living-zeta.vercel.app) is not listed,
 * so the full site stays available there for review.
 *
 * Launch day: set the Vercel environment variable COMING_SOON=off and redeploy. No DNS or code change.
 */
export const COMING_SOON_HOSTS = ["atmosfereliving.in", "www.atmosfereliving.in"];

export const isComingSoonHost = (host: string | null | undefined) =>
  process.env.COMING_SOON !== "off" && COMING_SOON_HOSTS.includes((host ?? "").split(":")[0].toLowerCase());

/** The coming soon banner (16:9, "LIVING / COMING SOON" on the left), in /public/coming-soon/. */
export const COMING_SOON_BANNER = "/coming-soon/living-banner.webp";
