import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel, Table, Td, Empty } from "@/components/admin/ui";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import type { Product } from "@/lib/types";
import { img, inr } from "@/lib/utils";

export const metadata = { title: "Products" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; saved?: string }> }) {
  const { q, category, saved } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("products").select("*, category:categories(name, slug)").order("created_at", { ascending: false });
  if (q) query = query.or(`name.ilike.%${q.replace(/[%,()]/g, "")}%,sku.ilike.%${q.replace(/[%,()]/g, "")}%`);
  if (category) query = query.eq("category_id", category);
  const [{ data }, { data: cats }] = await Promise.all([query, supabase.from("categories").select("id, name").order("sort_order")]);
  const products = (data as Product[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products`}
        action={
          <Link href="/admin/products/new" className="btn btn-dark">
            <Plus size={14} /> Add product
          </Link>
        }
      />
      {saved && <p className="mb-6 rounded-sm bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Product saved.</p>}

      <form className="mb-6 flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="Search by name or SKU" className="field !min-h-10 max-w-xs" />
        <select name="category" defaultValue={category ?? ""} className="field !min-h-10 max-w-[200px]">
          <option value="">All categories</option>
          {(cats ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="btn btn-outline !min-h-10 bg-white">Filter</button>
      </form>

      <Panel>
        {products.length === 0 ? (
          <Empty>No products found.</Empty>
        ) : (
          <Table head={["Product", "Category", "Price", "Stock", "Active", "Featured", ""]}>
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-stone-100/50">
                <Td>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-4">
                    <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-stone-100">
                      <Image src={img(p.images[0], 120)} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                    <span>
                      <span className="block font-medium hover:underline">{p.name}</span>
                      <span className="block text-xs text-stone-400">{p.sku ?? p.slug}</span>
                    </span>
                  </Link>
                </Td>
                <Td className="text-stone-600">{p.category?.name ?? "—"}</Td>
                <Td>
                  {inr(p.price)}
                  {p.compare_at_price && <span className="ml-2 text-xs text-stone-400 line-through">{inr(p.compare_at_price)}</span>}
                </Td>
                <Td>
                  <span className={p.stock === 0 ? "text-red-700" : p.stock <= 5 ? "text-amber-700" : ""}>{p.stock}</span>
                </Td>
                <ProductRowActions id={p.id} active={p.is_active} featured={p.is_featured} />
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
