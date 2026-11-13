import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel, Empty, FilterTabs } from "@/components/admin/ui";
import { ReviewControls } from "@/components/admin/ReviewControls";
import { StatusBadge } from "@/components/StatusBadge";
import { Stars } from "@/components/store/Stars";
import type { Review, ReviewStatus } from "@/lib/types";
import { fmtDate } from "@/lib/utils";

export const metadata = { title: "Reviews" };

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "pending" } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("reviews").select("*, product:products(name, slug)").order("created_at", { ascending: false }).limit(200);
  if (status !== "all") query = query.eq("status", status as ReviewStatus);
  const { data } = await query;
  const reviews = (data as Review[]) ?? [];

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Approve reviews before they appear on product pages." />
      <FilterTabs
        base="/admin/reviews"
        current={status}
        options={[
          ["pending", "Pending"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
          ["all", "All"],
        ]}
      />
      <Panel>
        {reviews.length === 0 ? (
          <Empty>No {status === "all" ? "" : status} reviews.</Empty>
        ) : (
          <ul className="divide-y divide-stone-200">
            {reviews.map((r) => (
              <li key={r.id} className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Stars value={r.rating} size={13} />
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-stone-400">
                      {r.author_name ?? "Customer"} · {fmtDate(r.created_at)}
                    </span>
                  </div>
                  {r.product && (
                    <Link href={`/products/${r.product.slug}`} target="_blank" className="text-xs tracking-[0.14em] uppercase text-accent hover:underline">
                      {r.product.name}
                    </Link>
                  )}
                  {r.title && <p className="font-medium">{r.title}</p>}
                  <p className="text-sm text-stone-600">{r.body}</p>
                </div>
                <ReviewControls id={r.id} status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
