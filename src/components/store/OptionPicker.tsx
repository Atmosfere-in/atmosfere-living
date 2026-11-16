"use client";

import { cx, inr, usableOptions } from "@/lib/utils";
import type { ProductOption } from "@/lib/types";

/**
 * Variation picker. Choices with a colour or texture show as round swatches;
 * the rest show as small text pills. `compact` is the dense version used in corner cards.
 */
export function OptionPicker({
  options,
  chosen,
  onChange,
  compact = false,
  showExtraPrice = true,
}: {
  options?: ProductOption[] | null;
  chosen: Record<string, string>;
  onChange: (name: string, value: string) => void;
  compact?: boolean;
  showExtraPrice?: boolean;
}) {
  const list = usableOptions(options);
  if (!list.length) return null;

  return (
    <div className={compact ? "space-y-3" : "space-y-7"}>
      {list.map((o) => (
        <fieldset key={o.name}>
          <legend className={cx("font-medium uppercase", compact ? "text-[0.6rem] tracking-[0.22em] text-stone-400" : "text-[0.7rem] tracking-[0.2em]")}>
            {o.name}
            <span className={cx("ml-2 font-normal normal-case tracking-normal", compact ? "text-ink" : "text-stone-600")}>{chosen[o.name]}</span>
          </legend>
          <div className={cx("flex flex-wrap", compact ? "mt-2 gap-1.5" : "mt-3 gap-2")}>
            {o.values.map((v) => {
              const active = chosen[o.name] === v.label;
              const extra = showExtraPrice && Number(v.price) > 0 ? ` (+${inr(v.price)})` : "";
              const visual = v.image || v.swatch;
              if (visual) {
                return (
                  <button
                    key={v.label}
                    type="button"
                    title={`${v.label}${extra}`}
                    aria-label={`${o.name}: ${v.label}${extra}`}
                    aria-pressed={active}
                    onClick={() => onChange(o.name, v.label)}
                    className={cx(
                      "relative grid place-items-center rounded-full transition-[box-shadow,transform] duration-300 cursor-pointer hover:scale-105",
                      compact ? "h-7 w-7" : "h-10 w-10",
                      active ? "shadow-[0_0_0_1.5px_var(--color-ivory),0_0_0_2.5px_var(--color-ink)]" : "shadow-[0_0_0_1px_var(--color-stone-200)]",
                    )}
                  >
                    <span
                      className="absolute inset-0 rounded-full bg-cover bg-center"
                      style={v.image ? { backgroundImage: `url(${v.image})` } : { backgroundColor: v.swatch }}
                    />
                  </button>
                );
              }
              return (
                <button
                  key={v.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange(o.name, v.label)}
                  className={cx(
                    "rounded-full border transition-colors cursor-pointer",
                    compact ? "min-h-7 px-3 text-xs" : "min-h-10 px-4 text-sm",
                    active ? "border-ink bg-ink text-ivory" : "border-stone-200 hover:border-ink",
                  )}
                >
                  {v.label}
                  {extra && <span className={cx("ml-1 text-xs", active ? "text-ivory/70" : "text-stone-400")}>{extra.trim()}</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
