import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { CornerForm } from "@/components/admin/CornerForm";
import type { VibeCorner } from "@/lib/types";

export const metadata = { title: "Edit corner" };

export default async function EditCorner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: corner }, { data: products }] = await Promise.all([
    supabase.from("vibe_corners").select("*, items:vibe_corner_items(*)").eq("id", id).maybeSingle(),
    supabase.from("products").select("id, name, images, options, is_demo, is_active").order("is_demo").order("name"),
  ]);
  if (!corner) notFound();
  return (
    <div>
      <PageHeader title={corner.name} subtitle="Edit corner" />
      <CornerForm corner={corner as VibeCorner} products={products ?? []} />
    </div>
  );
}
