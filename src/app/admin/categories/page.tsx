import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/CategoryManager";
import type { Category } from "@/lib/types";

export const metadata = { title: "Categories" };

export default async function AdminCategories() {
  const supabase = await createClient();
  const [{ data }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("category_id"),
  ]);
  const counts: Record<string, number> = {};
  for (const p of products ?? []) if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
  return (
    <div>
      <PageHeader title="Categories" subtitle="Shown in the store navigation and on the homepage." />
      <CategoryManager categories={(data as Category[]) ?? []} counts={counts} />
    </div>
  );
}
