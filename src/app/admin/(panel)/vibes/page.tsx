import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Empty, PageHeader, Panel, Table, Td } from "@/components/admin/ui";
import { CornerRowActions } from "@/components/admin/CornerRowActions";
import type { VibeCorner } from "@/lib/types";
import { img } from "@/lib/utils";

export const metadata = { title: "Shop by Vibe" };

export default async function AdminVibes({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("vibe_corners").select("*, items:vibe_corner_items(id)").order("sort_order");
  const corners = (data as VibeCorner[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Shop by Vibe"
        subtitle="Styled corners customers can shop as a whole or piece by piece."
        action={
          <Link href="/admin/vibes/new" className="btn btn-dark">
            <Plus size={14} /> Add corner
          </Link>
        }
      />
      {saved && <p className="mb-6 rounded-sm bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Corner saved.</p>}

      <Panel>
        {corners.length === 0 ? (
          <Empty>No corners yet. Add your first styled corner.</Empty>
        ) : (
          <Table head={["Corner", "Pieces", "Order", "Visible", ""]}>
            {corners.map((c) => (
              <tr key={c.id} className="hover:bg-stone-100/50">
                <Td>
                  <Link href={`/admin/vibes/${c.id}`} className="flex items-center gap-4">
                    <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded bg-stone-100">
                      <Image src={img(c.image, 200)} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                    <span>
                      <span className="block font-medium hover:underline">{c.name}</span>
                      <span className="block text-xs text-stone-400">/vibes/{c.slug}</span>
                    </span>
                  </Link>
                </Td>
                <Td>{c.items?.length ?? 0}</Td>
                <Td className="text-stone-600">{c.sort_order}</Td>
                <CornerRowActions id={c.id} name={c.name} active={c.is_active} slug={c.slug} />
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
