"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { ProductOption, ProductOptionValue } from "@/lib/types";

/**
 * Edits a product's variations (e.g. Polish → Natural / Walnut) and submits them
 * as JSON in a hidden "options" field. Empty rows are dropped on save.
 */
export function OptionsEditor({ initial }: { initial?: ProductOption[] | null }) {
  const [options, setOptions] = useState<ProductOption[]>(initial ?? []);

  const setOption = (i: number, next: ProductOption) => setOptions((all) => all.map((o, j) => (j === i ? next : o)));
  const removeOption = (i: number) => setOptions((all) => all.filter((_, j) => j !== i));

  return (
    <section className="card space-y-5 p-6">
      <div>
        <h2 className="text-[0.7rem] font-medium tracking-[0.2em] uppercase">Variations</h2>
        <p className="mt-1 text-xs text-stone-400">
          Choices the customer picks, e.g. Polish, Fabric, Wood. Leave extra price at 0 if it costs the same. Click the circle to give a
          choice a colour or texture photo — it then shows as a swatch.
        </p>
      </div>
      <input type="hidden" name="options" value={JSON.stringify(options)} />

      {options.map((o, i) => (
        <div key={i} className="space-y-3 rounded-md border border-stone-200 p-4">
          <div className="flex gap-2">
            <input
              value={o.name}
              onChange={(e) => setOption(i, { ...o, name: e.target.value })}
              placeholder="Variation name, e.g. Polish"
              className="field !min-h-10 font-medium"
            />
            <button type="button" onClick={() => removeOption(i)} aria-label="Remove variation" className="btn btn-outline !min-h-10 !px-3">
              <X size={14} />
            </button>
          </div>
          <ul className="space-y-2">
            {o.values.map((v, k) => (
              <li key={k} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <Swatch
                  value={v}
                  onChange={(patch) => setOption(i, { ...o, values: o.values.map((x, m) => (m === k ? { ...x, ...patch } : x)) })}
                />
                <input
                  value={v.label}
                  onChange={(e) => setOption(i, { ...o, values: o.values.map((x, m) => (m === k ? { ...x, label: e.target.value } : x)) })}
                  placeholder="Choice, e.g. Walnut"
                  className="field !min-h-10"
                />
                <div className="relative w-36 shrink-0">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">+₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={v.price}
                    onChange={(e) =>
                      setOption(i, { ...o, values: o.values.map((x, m) => (m === k ? { ...x, price: Math.max(0, Number(e.target.value) || 0) } : x)) })
                    }
                    aria-label="Extra price"
                    className="field !min-h-10 pl-8"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setOption(i, { ...o, values: o.values.filter((_, m) => m !== k) })}
                  aria-label="Remove choice"
                  className="px-2 text-stone-400 hover:text-ink cursor-pointer"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setOption(i, { ...o, values: [...o.values, { label: "", price: 0 }] })}
            className="inline-flex items-center gap-1 text-xs underline text-stone-600 hover:text-ink cursor-pointer"
          >
            <Plus size={12} /> Add choice
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setOptions((all) => [...all, { name: "", values: [{ label: "", price: 0 }] }])}
        className="btn btn-outline w-full"
      >
        <Plus size={14} /> Add variation
      </button>
    </section>
  );
}

/** Round swatch button: opens a small panel to pick a colour or paste a texture photo URL. */
function Swatch({ value, onChange }: { value: ProductOptionValue; onChange: (patch: Partial<ProductOptionValue>) => void }) {
  const [open, setOpen] = useState(false);
  const has = !!(value.image || value.swatch);
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Swatch colour or texture"
        className="grid h-10 w-10 place-items-center rounded-full border border-dashed border-stone-400 bg-cover bg-center cursor-pointer"
        style={value.image ? { backgroundImage: `url(${value.image})`, borderStyle: "solid" } : value.swatch ? { backgroundColor: value.swatch, borderStyle: "solid" } : undefined}
      >
        {!has && <Plus size={12} className="text-stone-400" />}
      </button>
      {open && (
        <div className="absolute left-0 top-12 z-10 w-64 space-y-3 rounded-md border border-stone-200 bg-white p-4 shadow-lg">
          <label className="flex items-center justify-between gap-3 text-xs">
            Colour
            <input type="color" value={value.swatch ?? "#c8a27a"} onChange={(e) => onChange({ swatch: e.target.value })} className="h-8 w-12 cursor-pointer" />
          </label>
          <input
            value={value.image ?? ""}
            onChange={(e) => onChange({ image: e.target.value.trim() || undefined })}
            placeholder="Texture photo URL (optional)"
            className="field !min-h-9 text-xs"
          />
          <div className="flex justify-between text-xs">
            <button type="button" onClick={() => onChange({ swatch: undefined, image: undefined })} className="underline text-stone-600 cursor-pointer">
              Remove
            </button>
            <button type="button" onClick={() => setOpen(false)} className="underline cursor-pointer">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
