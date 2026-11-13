"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/store";
import { cx } from "@/lib/utils";

const LINKS = [
  ["/account", "Overview"],
  ["/account/orders", "Orders"],
  ["/account/wishlist", "Wishlist"],
  ["/account/addresses", "Addresses"],
  ["/account/profile", "Profile"],
  ["/account/password", "Password"],
];

export function AccountNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-0 lg:border-t lg:border-stone-200">
      {LINKS.map(([href, label]) => {
        const active = href === "/account" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cx(
              "shrink-0 rounded-full border px-4 py-2 text-[0.7rem] tracking-[0.18em] uppercase lg:rounded-none lg:border-0 lg:border-b lg:border-stone-200 lg:px-0 lg:py-4",
              active ? "border-charcoal bg-charcoal text-ivory lg:bg-transparent lg:text-ink lg:font-medium" : "border-stone-200 text-stone-600 hover:text-ink",
            )}
          >
            {label}
          </Link>
        );
      })}
      <form action={signOut}>
        <button className="shrink-0 cursor-pointer rounded-full border border-stone-200 px-4 py-2 text-[0.7rem] tracking-[0.18em] uppercase text-stone-600 hover:text-ink lg:rounded-none lg:border-0 lg:px-0 lg:py-4">
          Sign out
        </button>
      </form>
    </nav>
  );
}
