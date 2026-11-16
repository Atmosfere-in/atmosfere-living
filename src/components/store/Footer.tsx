import Link from "next/link";
import { Logo } from "@/components/Logo";
import { POLICY_LINKS } from "./PolicyPage";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100 text-ink">
      <div className="container-lux grid gap-14 py-20 md:grid-cols-12">
        <div className="md:col-span-4 space-y-6">
          <Logo className="h-7" />
          <p className="display text-3xl leading-snug max-w-sm">
            Curated furniture and decor, styled corner by corner.
          </p>
          <form action="/shop" className="flex max-w-sm border-b border-stone-400">
            <input
              type="email"
              name="newsletter"
              placeholder="Your email for new arrivals"
              className="flex-1 bg-transparent py-3 text-sm placeholder:text-stone-400 outline-none"
            />
            <button className="text-[0.68rem] tracking-[0.22em] uppercase cursor-pointer">Join</button>
          </form>
        </div>
        <FooterCol
          title="Shop"
          links={[
            ["/shop?category=furniture", "Furniture"],
            ["/shop?category=lighting", "Lighting"],
            ["/shop?category=decor", "Decor"],
            ["/shop?category=textiles", "Textiles"],
            ["/shop?category=wall-art", "Wall Art"],
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            ["/account", "My account"],
            ["/account/orders", "Orders"],
            ["/account/wishlist", "Wishlist"],
            ["/cart", "Bag"],
          ]}
        />
        <FooterCol title="Help" links={POLICY_LINKS} />
        <FooterCol
          title="Atmosfere"
          links={[
            ["https://www.atmosfere.in/spaces", "Spaces"],
            ["https://www.atmosfere.in/hospitality", "Hospitality"],
            ["https://www.atmosfere.in", "atmosfere.in"],
          ]}
        />
      </div>
      <div className="container-lux flex flex-col gap-3 border-t border-stone-200 py-6 text-xs text-stone-600 md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Atmosfere. All rights reserved.</p>
        <p>Prices in INR, inclusive of GST.</p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="md:col-span-2 space-y-5">
      <p className="text-[0.68rem] tracking-[0.32em] uppercase text-stone-400">{title}</p>
      <ul className="space-y-3 text-sm text-stone-600">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="hover:text-ink transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
