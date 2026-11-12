import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="container-lux grid gap-14 py-20 md:grid-cols-12">
        <div className="md:col-span-5 space-y-6">
          <Logo className="h-7" />
          <p className="display text-3xl leading-snug text-ivory/90 max-w-sm">
            Curated furniture and decor, styled corner by corner.
          </p>
          <form action="/shop" className="flex max-w-sm border-b border-ivory/30">
            <input
              type="email"
              name="newsletter"
              placeholder="Your email for new arrivals"
              className="flex-1 bg-transparent py-3 text-sm placeholder:text-ivory/40 outline-none"
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
        <FooterCol
          title="Atmosfere"
          links={[
            ["https://www.atmosfere.in/spaces", "Spaces"],
            ["https://www.atmosfere.in/hospitality", "Hospitality"],
            ["https://www.atmosfere.in", "atmosfere.in"],
          ]}
        />
      </div>
      <div className="container-lux flex flex-col gap-3 border-t border-ivory/10 py-6 text-xs text-ivory/50 md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Atmosfere. All rights reserved.</p>
        <p>Prices in INR, inclusive of GST.</p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="md:col-span-2 space-y-5">
      <p className="text-[0.68rem] tracking-[0.32em] uppercase text-ivory/50">{title}</p>
      <ul className="space-y-3 text-sm text-ivory/80">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="hover:text-ivory transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
