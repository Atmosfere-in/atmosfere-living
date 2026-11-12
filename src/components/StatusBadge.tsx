import { cx } from "@/lib/utils";

const tone: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800",
  confirmed: "bg-sky-50 text-sky-800",
  processing: "bg-indigo-50 text-indigo-800",
  shipped: "bg-violet-50 text-violet-800",
  delivered: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-stone-100 text-stone-600",
  unpaid: "bg-amber-50 text-amber-800",
  paid: "bg-emerald-50 text-emerald-800",
  refunded: "bg-stone-100 text-stone-600",
  failed: "bg-red-50 text-red-800",
  approved: "bg-emerald-50 text-emerald-800",
  rejected: "bg-red-50 text-red-800",
  active: "bg-emerald-50 text-emerald-800",
  inactive: "bg-stone-100 text-stone-600",
  admin: "bg-charcoal text-ivory",
  customer: "bg-stone-100 text-stone-600",
  blocked: "bg-red-50 text-red-800",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={cx("badge", tone[status] ?? "")}>{status.replace("_", " ")}</span>;
}
