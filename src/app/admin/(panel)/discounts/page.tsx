import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { DiscountManager } from "@/components/admin/DiscountManager";
import type { DiscountCode } from "@/lib/types";

export const metadata = { title: "Discounts & offers" };

export default async function AdminDiscounts() {
  const supabase = await createClient();
  const { data } = await supabase.from("discount_codes").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <PageHeader title="Discounts & offers" subtitle="Codes customers can apply at checkout." />
      <DiscountManager codes={(data as DiscountCode[]) ?? []} />
    </div>
  );
}
