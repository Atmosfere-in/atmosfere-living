"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, User, X } from "lucide-react";
import { BrandLockup } from "@/components/Logo";
import { useCart } from "@/components/cart/CartProvider";
import { cx } from "@/lib/utils";

const NAV = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=furniture", label: "Furniture" },
  { href: "/shop?category=lighting", label: "Lighting" },
  { href: "/shop?category=decor", label: "Decor" },
  { href: "/shop?category=textiles", label: "Textiles" },
  { href: "/shop?category=wall-art", label: "Wall Art" },
];

export function Header({ user }: { user: { name: string | null; isAdmin: boolean } | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { count, setOpen, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");

  const overlay = pathname === "/";
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [pathname]);

  const transparent = overlay && !scrolled && !menu && !search;

  return (
    <>
      <div className="bg-charcoal text-ivory/80 text-center text-[0.68rem] tracking-[0.22em] uppercase py-2.5 px-4">
        Complimentary shipping on orders above ₹5,000 · Use <span className="text-ivory">WELCOME10</span> for 10% off
      </div>
      <header
        className={cx(
          "sticky top-0 z-40 transition-colors duration-500",
          transparent ? "text-ivory" : "bg-ivory/95 text-ink backdrop-blur-md shadow-[0_1px_0_var(--color-stone-200)]",
          overlay && "-mb-[var(--header-height)]",
        )}
      >
        <div className="container-lux flex h-[var(--header-height)] items-center justify-between gap-6">
          <Link href="/" aria-label="Atmosfere Living home" className="shrink-0">
            <BrandLockup />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-[0.7rem] font-medium tracking-[0.2em] uppercase opacity-80 hover:opacity-100 transition-opacity"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <IconBtn label="Search" onClick={() => setSearch((s) => !s)}>
              {search ? <X size={18} strokeWidth={1.4} /> : <Search size={18} strokeWidth={1.4} />}
            </IconBtn>
            <Link
              href={user ? (user.isAdmin ? "/admin" : "/account") : "/login"}
              aria-label={user ? "Your account" : "Sign in"}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-current/5"
            >
              <User size={18} strokeWidth={1.4} />
            </Link>
            <IconBtn label="Open bag" onClick={() => setOpen(true)}>
              <span className="relative">
                <ShoppingBag size={18} strokeWidth={1.4} />
                {ready && count > 0 && (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[0.6rem] text-ivory">
                    {count}
                  </span>
                )}
              </span>
            </IconBtn>
            <button
              aria-label="Menu"
              onClick={() => setMenu((m) => !m)}
              className="lg:hidden ml-1 grid h-10 w-10 place-items-center"
            >
              <span className="relative block h-3 w-6">
                <span className={cx("absolute left-0 h-px w-6 bg-current transition-transform duration-500", menu ? "top-1.5 rotate-45" : "top-0")} />
                <span className={cx("absolute left-0 h-px w-6 bg-current transition-transform duration-500", menu ? "top-1.5 -rotate-45" : "top-3")} />
              </span>
            </button>
          </div>
        </div>

        {search && (
          <form
            className="container-lux pb-6"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/shop?q=${encodeURIComponent(q)}`);
            }}
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search vases, lighting, sofas…"
              className="w-full border-b border-stone-200 bg-transparent py-3 font-display text-2xl outline-none placeholder:text-stone-400 focus:border-ink"
            />
          </form>
        )}

        {menu && (
          <nav className="lg:hidden container-lux flex h-[calc(100dvh-var(--header-height)-34px)] flex-col justify-between pb-10 pt-6">
            <ul className="space-y-3">
              {NAV.map((n, i) => (
                <li key={n.href} className="rise" style={{ animationDelay: `${i * 50}ms` }}>
                  <Link href={n.href} className="display text-4xl">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="space-y-4">
              <Link href={user ? "/account" : "/login"} className="btn btn-dark">
                {user ? "My account" : "Sign in"}
              </Link>
              <a href="https://www.atmosfere.in" className="block text-sm text-stone-600">
                ← All of Atmosfere
              </a>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} onClick={onClick} className="grid h-10 w-10 place-items-center rounded-full cursor-pointer">
      {children}
    </button>
  );
}
