"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { deleteDiscount, saveDiscount, toggleDiscount } from "@/lib/actions/admin";
import { Panel, Table, Td, Empty } from "./ui";
import { Toggle } from "./Toggle";
import type { DiscountCode } from "@/lib/types";
import { fmtDate, inr } from "@/lib/utils";

const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export function DiscountManager({ codes }: { codes: DiscountCode[] }) {
  const [editing, setEditing] = useState<DiscountCode | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const d = editing && editing !== "new" ? editing : null;

  const status = (c: DiscountCode) => {
    const now = Date.now();
    if (!c.is_active) return ["Inactive", "bg-stone-100 text-stone-600"];
    if (c.expires_at && +new Date(c.expires_at) < now) return ["Expired", "bg-red-50 text-red-800"];
    if (c.starts_at && +new Date(c.starts_at) > now) return ["Scheduled", "bg-sky-50 text-sky-800"];
    if (c.usage_limit && c.used_count >= c.usage_limit) return ["Used up", "bg-amber-50 text-amber-800"];
    return ["Live", "bg-emerald-50 text-emerald-800"];
  };

  return (
    <div className="space-y-8">
      {editing ? (
        <Panel title={d ? `Edit ${d.code}` : "New discount code"}>
          <form
            key={d?.id ?? "new"}
            className="grid gap-5 p-6 md:grid-cols-3"
            action={(fd) =>
              start(async () => {
                setError(null);
                const r = await saveDiscount(fd);
                if (r.ok) setEditing(null);
                else setError(r.error);
              })
            }
          >
            {d && <input type="hidden" name="id" value={d.id} />}
            <F label="Code *" name="code" d={d?.code} placeholder="WELCOME10" required />
            <div>
              <label className="label">Type</label>
              <select name="type" defaultValue={d?.type ?? "percent"} className="field">
                <option value="percent">Percentage off</option>
                <option value="fixed">Fixed amount (₹) off</option>
              </select>
            </div>
            <F label="Value *" name="value" type="number" d={d?.value} required />
            <F label="Description (shown at checkout)" name="description" d={d?.description} wide />
            <F label="Minimum order (₹)" name="min_order_amount" type="number" d={d?.min_order_amount ?? 0} />
            <F label="Max discount (₹, for % codes)" name="max_discount_amount" type="number" d={d?.max_discount_amount} />
            <F label="Total usage limit" name="usage_limit" type="number" d={d?.usage_limit} placeholder="Unlimited" />
            <F label="Starts" name="starts_at" type="datetime-local" d={toLocal(d?.starts_at ?? null)} />
            <F label="Expires" name="expires_at" type="datetime-local" d={toLocal(d?.expires_at ?? null)} />
            <label className="flex items-center gap-3 self-end pb-3 text-sm">
              <input type="checkbox" name="is_active" defaultChecked={d?.is_active ?? true} className="accent-[var(--color-accent)]" />
              Active
            </label>
            {error && <p className="text-sm text-red-700 md:col-span-3">{error}</p>}
            <div className="flex gap-3 md:col-span-3">
              <button disabled={pending} className="btn btn-dark">
                {pending ? "Saving…" : "Save code"}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="btn btn-outline bg-white">
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      ) : (
        <button onClick={() => setEditing("new")} className="btn btn-dark">
          <Plus size={14} /> New discount code
        </button>
      )}

      <Panel>
        {codes.length === 0 ? (
          <Empty>No discount codes yet.</Empty>
        ) : (
          <Table head={["Code", "Offer", "Conditions", "Used", "Valid", "Status", "Active", ""]}>
            {codes.map((c) => {
              const [label, cls] = status(c);
              return (
                <tr key={c.id} className="hover:bg-stone-100/50">
                  <Td>
                    <span className="font-mono font-medium">{c.code}</span>
                    {c.description && <span className="block text-xs text-stone-400">{c.description}</span>}
                  </Td>
                  <Td>{c.type === "percent" ? `${Number(c.value)}% off` : `${inr(c.value)} off`}</Td>
                  <Td className="text-xs text-stone-600">
                    {Number(c.min_order_amount) > 0 ? `Min ${inr(c.min_order_amount)}` : "No minimum"}
                    {c.max_discount_amount ? ` · Max ${inr(c.max_discount_amount)}` : ""}
                  </Td>
                  <Td>
                    {c.used_count}
                    {c.usage_limit ? ` / ${c.usage_limit}` : ""}
                  </Td>
                  <Td className="text-xs text-stone-600">
                    {c.starts_at ? fmtDate(c.starts_at) : "Now"} → {c.expires_at ? fmtDate(c.expires_at) : "No expiry"}
                  </Td>
                  <Td>
                    <span className={`badge ${cls}`}>{label}</span>
                  </Td>
                  <Td>
                    <Toggle checked={c.is_active} label="Active" disabled={pending} onChange={(v) => start(async () => void (await toggleDiscount(c.id, v)))} />
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-3 text-xs">
                      <button onClick={() => setEditing(c)} className="underline cursor-pointer">
                        Edit
                      </button>
                      <button
                        onClick={() => confirm(`Delete ${c.code}?`) && start(async () => void (await deleteDiscount(c.id)))}
                        className="text-red-700 underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
      </Panel>
    </div>
  );
}

function F({
  label,
  name,
  d,
  type = "text",
  required,
  placeholder,
  wide,
}: {
  label: string;
  name: string;
  d?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <label className="label">{label}</label>
      <input name={name} type={type} step={type === "number" ? "any" : undefined} min={type === "number" ? 0 : undefined} defaultValue={d ?? ""} required={required} placeholder={placeholder} className="field" />
    </div>
  );
}
