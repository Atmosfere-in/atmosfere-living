"use client";

import { useState, useTransition } from "react";
import { deleteAddress, saveAddress } from "@/lib/actions/store";
import type { Address } from "@/lib/types";

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<Address | "new" | null>(addresses.length ? null : "new");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const current = editing && editing !== "new" ? editing : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className="card p-6 text-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="badge">{a.label ?? "Address"}</span>
              {a.is_default && <span className="badge text-accent">Default</span>}
            </div>
            <p className="font-medium">{a.full_name}</p>
            <p className="text-stone-600">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postal_code}
            </p>
            <p className="text-stone-600">{a.phone}</p>
            <div className="mt-4 flex gap-4 text-xs tracking-[0.16em] uppercase">
              <button onClick={() => setEditing(a)} className="underline cursor-pointer">
                Edit
              </button>
              <button
                onClick={() => confirm("Delete this address?") && start(async () => void (await deleteAddress(a.id)))}
                className="text-stone-400 underline hover:text-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {editing === null && (
          <button onClick={() => setEditing("new")} className="card grid min-h-40 place-items-center p-6 text-sm hover:border-ink cursor-pointer">
            + Add a new address
          </button>
        )}
      </div>

      {editing && (
        <form
          key={current?.id ?? "new"}
          className="card grid gap-4 p-6 sm:grid-cols-2"
          action={(fd) =>
            start(async () => {
              setError(null);
              const r = await saveAddress(fd);
              if (r.ok) setEditing(null);
              else setError(r.error);
            })
          }
        >
          {current && <input type="hidden" name="id" value={current.id} />}
          <F name="label" label="Label (e.g. Home, Office)" d={current?.label} />
          <F name="full_name" label="Full name" d={current?.full_name} required />
          <F name="phone" label="Phone" d={current?.phone} required />
          <F name="postal_code" label="PIN code" d={current?.postal_code} required />
          <F name="line1" label="Address line 1" d={current?.line1} required wide />
          <F name="line2" label="Address line 2" d={current?.line2} wide />
          <F name="city" label="City" d={current?.city} required />
          <F name="state" label="State" d={current?.state} required />
          <label className="flex items-center gap-3 text-sm sm:col-span-2">
            <input type="checkbox" name="is_default" defaultChecked={current?.is_default ?? addresses.length === 0} className="accent-[var(--color-accent)]" />
            Make this my default address
          </label>
          {error && <p className="text-sm text-red-700 sm:col-span-2">{error}</p>}
          <div className="flex gap-3 sm:col-span-2">
            <button disabled={pending} className="btn btn-dark">
              {pending ? "Saving…" : "Save address"}
            </button>
            {addresses.length > 0 && (
              <button type="button" onClick={() => setEditing(null)} className="btn btn-outline">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function F({ name, label, d, required, wide }: { name: string; label: string; d?: string | null; required?: boolean; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} defaultValue={d ?? ""} required={required} className="field" />
    </div>
  );
}
