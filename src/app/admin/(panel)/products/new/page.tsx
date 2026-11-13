import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "New product" };

export default async function NewProduct() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name").order("sort_order");
  return (
    <div>
      <PageHeader title="New product" />
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
