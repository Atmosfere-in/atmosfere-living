"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { deleteCategory, saveCategory } from "@/lib/actions/admin";
import { Panel, Table, Td, Empty } from "./ui";
import type { Category } from "@/lib/types";
import { img } from "@/lib/utils";

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const c = editing && editing !== "new" ? editing : null;

  return (
    <div className="space-y-8">
      {editing ? (
        <Panel title={c ? `Edit ${c.name}` : "New category"}>
          <form
            key={c?.id ?? "new"}
            className="grid gap-5 p-6 md:grid-cols-2"
            action={(fd) =>
              start(async () => {
                setError(null);
                const r = await saveCategory(fd);
                if (r.ok) setEditing(null);
                else setError(r.error);
              })
            }
          >
            {c && <input type="hidden" name="id" value={c.id} />}
            <div>
              <label className="label">Name *</label>
              <input name="name" defaultValue={c?.name} required className="field" />
            </div>
            <div>
              <label className="label">Slug</label>
              <input name="slug" defaultValue={c?.slug} className="field" placeholder="auto from name" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <input name="description" defaultValue={c?.description ?? ""} className="field" />
            </div>
            <div>
              <label className="label">Image URL</label>
              <input name="image_url" defaultValue={c?.image_url ?? ""} className="field" />
            </div>
            <div>
              <label className="label">Sort order</label>
              <input name="sort_order" type="number" defaultValue={c?.sort_order ?? categories.length + 1} className="field" />
            </div>
            {error && <p className="text-sm text-red-700 md:col-span-2">{error}</p>}
            <div className="flex gap-3 md:col-span-2">
              <button disabled={pending} className="btn btn-dark">
                {pending ? "Saving…" : "Save category"}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="btn btn-outline bg-white">
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      ) : (
        <button onClick={() => setEditing("new")} className="btn btn-dark">
          <Plus size={14} /> New category
        </button>
      )}

      <Panel>
        {categories.length === 0 ? (
          <Empty>No categories yet.</Empty>
        ) : (
          <Table head={["Category", "Slug", "Products", "Order", ""]}>
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-stone-100/50">
                <Td>
                  <span className="flex items-center gap-4">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-stone-100">
                      {cat.image_url && <Image src={img(cat.image_url, 120)} alt="" fill sizes="48px" className="object-cover" />}
                    </span>
                    <span>
                      <span className="block font-medium">{cat.name}</span>
                      <span className="block text-xs text-stone-400">{cat.description}</span>
                    </span>
                  </span>
                </Td>
                <Td className="text-stone-600">{cat.slug}</Td>
                <Td>{counts[cat.id] ?? 0}</Td>
                <Td>{cat.sort_order}</Td>
                <Td>
                  <div className="flex justify-end gap-3 text-xs">
                    <button onClick={() => setEditing(cat)} className="underline cursor-pointer">
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        confirm(`Delete ${cat.name}? Its products become uncategorised.`) &&
                        start(async () => {
                          const r = await deleteCategory(cat.id);
                          if (!r.ok) alert(r.error);
                        })
                      }
                      className="text-red-700 underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
