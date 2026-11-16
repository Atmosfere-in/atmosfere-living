import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { CornerForm } from "@/components/admin/CornerForm";

export const metadata = { title: "New corner" };

export default async function NewCorner() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, images, options, is_demo, is_active")
    .order("is_demo")
    .order("name");
  return (
    <div>
      <PageHeader title="New corner" subtitle="Upload a styled corner and place the products in it." />
      <CornerForm products={products ?? []} />
    </div>
  );
}
