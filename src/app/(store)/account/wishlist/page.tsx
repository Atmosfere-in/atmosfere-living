import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/ProductCard";
import type { Product } from "@/lib/types";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const { user } = await requireUser("/account/wishlist");
  const supabase = await createClient();
  const { data } = await supabase
    .from("wishlist")
    .select("product:products(*, category:categories(name, slug))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const products = ((data ?? []) as unknown as { product: Product | null }[]).map((r) => r.product).filter(Boolean) as Product[];

  return (
    <div>
      <h2 className="display text-3xl">Wishlist</h2>
      {products.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="display text-2xl">Nothing saved yet.</p>
          <p className="mt-2 text-sm text-stone-600">Tap the heart on any piece to keep it here.</p>
          <Link href="/shop" className="btn btn-dark mt-6">
            Explore the shop
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
