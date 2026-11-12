"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="flex items-center gap-3 text-xs tracking-[0.18em] uppercase text-stone-600">
      Sort
      <select
        value={value}
        onChange={(e) => {
          const p = new URLSearchParams(params);
          p.set("sort", e.target.value);
          router.push(`${pathname}?${p}`);
        }}
        className="cursor-pointer border-b border-stone-200 bg-transparent py-1 pr-2 text-ink normal-case tracking-normal text-sm outline-none"
      >
        <option value="new">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="name">Name</option>
      </select>
    </label>
  );
}
