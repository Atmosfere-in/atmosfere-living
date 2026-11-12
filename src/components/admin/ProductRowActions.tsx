"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteProduct, toggleProduct } from "@/lib/actions/admin";
import { Toggle } from "./Toggle";

export function ProductRowActions({ id, active, featured }: { id: string; active: boolean; featured: boolean }) {
  const [pending, start] = useTransition();
  return (
    <>
      <td className="px-6 py-4">
        <Toggle checked={active} disabled={pending} onChange={(v) => start(async () => void (await toggleProduct(id, "is_active", v)))} label="Active" />
      </td>
      <td className="px-6 py-4">
        <Toggle checked={featured} disabled={pending} onChange={(v) => start(async () => void (await toggleProduct(id, "is_featured", v)))} label="Featured" />
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-1">
          <Link href={`/admin/products/${id}`} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded hover:bg-stone-100">
            <Pencil size={14} />
          </Link>
          <button
            aria-label="Delete"
            disabled={pending}
            onClick={() => {
              if (!confirm("Delete this product permanently? Consider deactivating it instead.")) return;
              start(async () => {
                const r = await deleteProduct(id);
                if (!r.ok) alert(r.error);
              });
            }}
            className="grid h-8 w-8 place-items-center rounded text-stone-400 hover:bg-red-50 hover:text-red-700 cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </>
  );
}
