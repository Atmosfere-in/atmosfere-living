"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BadgePercent, ExternalLink, FolderTree, LayoutDashboard, LogOut, Menu, Package, ShoppingCart, Star, Users, X } from "lucide-react";
import { BrandLockup } from "@/components/Logo";
import { signOut } from "@/lib/actions/store";
import { cx } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/users", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/discounts", label: "Discounts & offers", icon: BadgePercent },
];

export function AdminNav({ name }: { name: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between bg-charcoal px-5 py-4 text-ivory lg:hidden">
        <BrandLockup />
        <button aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <aside
        className={cx(
          "bg-charcoal text-ivory lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col",
          open ? "flex flex-col" : "hidden",
        )}
      >
        <div className="hidden px-7 pb-8 pt-8 lg:block">
          <BrandLockup />
          <p className="mt-3 text-[0.62rem] tracking-[0.32em] uppercase text-ivory/40">Admin</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-3 lg:py-0">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? path === href : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cx(
                  "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition-colors",
                  active ? "bg-ivory/10 text-ivory" : "text-ivory/60 hover:bg-ivory/5 hover:text-ivory",
                )}
              >
                <Icon size={16} strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-ivory/10 px-3 py-4">
          <Link href="/" className="flex items-center gap-3 rounded-md px-4 py-2.5 text-sm text-ivory/60 hover:text-ivory">
            <ExternalLink size={16} strokeWidth={1.5} /> View store
          </Link>
          <form action={signOut}>
            <button className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-sm text-ivory/60 hover:text-ivory cursor-pointer">
              <LogOut size={16} strokeWidth={1.5} /> Sign out
            </button>
          </form>
          <p className="truncate px-4 pt-2 text-xs text-ivory/40">{name}</p>
        </div>
      </aside>
    </>
  );
}
