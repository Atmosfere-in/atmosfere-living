export const inr = (n: number | string | null | undefined) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(n ?? 0),
  );

export const fmtDate = (d: string | Date) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Unsplash URLs get sized params; anything else is returned untouched. */
export const img = (url: string | null | undefined, w = 1200) => {
  if (!url) return "/placeholder.svg";
  if (url.includes("images.unsplash.com")) {
    const base = url.split("?")[0];
    return `${base}?w=${w}&q=80&auto=format&fit=crop`;
  }
  return url;
};

export const FREE_SHIPPING_THRESHOLD = 5000;
export const FLAT_SHIPPING = 250;
export const shippingFor = (amount: number) => (amount >= FREE_SHIPPING_THRESHOLD || amount === 0 ? 0 : FLAT_SHIPPING);

export const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

type OptionLike = { name: string; values: { label: string; price: number }[] };

/** Variations that actually have choices (empty ones are ignored everywhere). */
export const usableOptions = <T extends OptionLike>(options: T[] | null | undefined): T[] =>
  (options ?? []).filter((o) => o?.name?.trim() && o.values?.length);

/** Base price plus the extra charge of each chosen value. */
export const priceWithOptions = (base: number, options: OptionLike[] | null | undefined, chosen: Record<string, string>) =>
  usableOptions(options).reduce((sum, o) => sum + Number(o.values.find((v) => v.label === chosen[o.name])?.price ?? 0), Number(base));

/** "Polish: Walnut · Fabric: Jacquard" */
export const optionsText = (chosen: Record<string, string> | null | undefined) =>
  Object.entries(chosen ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");

/** One bag line per product + choice combination. */
export const cartLineId = (productId: string, chosen: Record<string, string> | null | undefined) => {
  const keys = Object.keys(chosen ?? {}).sort();
  return keys.length ? `${productId}|${keys.map((k) => `${k}=${chosen![k]}`).join("|")}` : productId;
};
