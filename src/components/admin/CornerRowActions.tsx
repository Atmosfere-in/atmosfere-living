"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { deleteCorner, toggleCorner } from "@/lib/actions/admin";
import { Toggle } from "./Toggle";

export function CornerRowActions({ id, name, active, slug }: { id: string; name: string; active: boolean; slug: string }) {
  const [pending, start] = useTransition();
  return (
    <>
      <td className="px-6 py-4">
        <Toggle checked={active} disabled={pending} onChange={(v) => start(async () => void (await toggleCorner(id, v)))} label="Visible" />
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-1">
          <Link href={`/vibes/${slug}`} target="_blank" aria-label="View in store" className="grid h-8 w-8 place-items-center rounded hover:bg-stone-100">
            <ExternalLink size={14} />
          </Link>
          <Link href={`/admin/vibes/${id}`} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded hover:bg-stone-100">
            <Pencil size={14} />
          </Link>
          <button
            aria-label="Delete"
            disabled={pending}
            onClick={() => {
              if (!confirm(`Delete the “${name}” corner permanently? Its products are not affected. Consider hiding it instead.`)) return;
              start(async () => {
                const r = await deleteCorner(id);
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
