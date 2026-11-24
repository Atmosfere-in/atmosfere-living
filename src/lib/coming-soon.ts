/**
 * Coming soon gate.
 *
 * Visitors arriving on these domains see only the coming soon page — every path, including shop,
 * products, cart, login and admin. The Vercel address (atmosfere-living-zeta.vercel.app) is not listed,
 * so the full site stays available there for review.
 *
 * Launch day: set the Vercel environment variable COMING_SOON=off and redeploy. No DNS or code change.
 */
export const COMING_SOON_HOSTS = ["atmosfere-living.in", "www.atmosfere-living.in"];

export const isComingSoonHost = (host: string | null | undefined) =>
  process.env.COMING_SOON !== "off" && COMING_SOON_HOSTS.includes((host ?? "").split(":")[0].toLowerCase());

/**
 * Banner images for the coming soon page, in /public/coming-soon/.
 * `mobile` is an optional tall version for phones; without it the desktop banner is used everywhere.
 * Leave `desktop` empty to show the text-only version.
 */
export const COMING_SOON_BANNER = {
  desktop: "",
  mobile: "",
  alt: "Atmosfere Living — coming soon",
};
