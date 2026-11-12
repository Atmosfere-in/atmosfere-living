import Link from "next/link";
import { cx } from "@/lib/utils";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-stone-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx("card overflow-hidden", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="text-[0.7rem] font-medium tracking-[0.2em] uppercase">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-left">
            {head.map((h) => (
              <th key={h} className="px-6 py-3 text-[0.65rem] font-medium tracking-[0.18em] uppercase text-stone-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">{children}</tbody>
      </table>
    </div>
  );
}

export const Td = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <td className={cx("px-6 py-4 align-middle", className)}>{children}</td>
);

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-16 text-center text-sm text-stone-600">{children}</div>;
}

export function FilterTabs({ base, current, options, param = "status" }: { base: string; current?: string; options: [string, string][]; param?: string }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {options.map(([v, label]) => (
        <Link
          key={v}
          href={v ? `${base}?${param}=${v}` : base}
          className={cx(
            "rounded-full border px-4 py-1.5 text-xs tracking-[0.12em] uppercase",
            (current ?? "") === v ? "border-charcoal bg-charcoal text-ivory" : "border-stone-200 bg-white hover:border-ink",
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
