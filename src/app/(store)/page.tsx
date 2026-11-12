import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories, getProducts, getRatings } from "@/lib/data";
import { ProductCard } from "@/components/store/ProductCard";
import { img } from "@/lib/utils";

const HERO = "https://images.unsplash.com/photo-1774477178005-bff823e43be8";
const STORY = "https://images.unsplash.com/photo-1578500494198-246f612d3b3d";
const EDIT = "https://images.unsplash.com/photo-1618220179428-22790b461013";
const SPACES = "https://images.unsplash.com/photo-1564078516393-cf04bd966897";

export default async function Home() {
  const [categories, featured, ratings] = await Promise.all([
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
    getRatings(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-charcoal text-ivory">
        <Image src={img(HERO, 2400)} alt="A softly lit living corner with a lounge chair and arc lamp" fill priority sizes="100vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-charcoal/40" />
        <div className="container-lux relative flex h-full flex-col justify-end pb-[12vh]">
          <p className="eyebrow !text-ivory/80 rise">Style &amp; Shop</p>
          <h1 className="display mt-5 max-w-4xl text-[clamp(2.75rem,6.5vw,6rem)] rise-2">
            Living, styled
            <br />
            corner by corner.
          </h1>
          <p className="mt-6 max-w-md text-ivory/80 font-light rise-3">
            Furniture, lighting and objects chosen by the designers behind Atmosfere Spaces — for homes that feel quietly considered.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 rise-3">
            <Link href="/shop" className="btn btn-light">
              Shop the collection <ArrowRight size={14} />
            </Link>
            <Link href="/shop?category=lighting" className="btn border border-ivory/40 text-ivory hover:bg-ivory/10">
              New in lighting
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-lux py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Shop by category</p>
            <h2 className="display mt-4 text-[clamp(2rem,4vw,3.25rem)]">Begin with a corner.</h2>
          </div>
          <Link href="/shop" className="link-underline">
            View everything <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className={`group relative overflow-hidden rounded-[18px] bg-charcoal text-ivory img-zoom ${i === 0 ? "col-span-2 md:col-span-1" : ""} aspect-[3/4]`}
            >
              {c.image_url && <Image src={img(c.image_url, 900)} alt={c.name} fill sizes="(min-width:768px) 20vw, 50vw" className="object-cover opacity-85" />}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-transparent to-transparent" />
              <span className="absolute left-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-ivory/50 font-display text-sm">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="absolute inset-x-5 bottom-5">
                <h3 className="display text-2xl">{c.name}</h3>
                <p className="mt-1 text-xs text-ivory/70 max-h-0 overflow-hidden opacity-0 transition-all duration-700 group-hover:max-h-12 group-hover:opacity-100">
                  {c.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="container-lux grid items-center gap-12 pb-24 md:grid-cols-2 md:gap-20 md:pb-32">
        <div className="relative aspect-[5/4] overflow-hidden rounded-[18px] shadow-[0_30px_60px_-30px_rgba(31,29,26,0.35)]">
          <Image src={img(STORY, 1600)} alt="A styled sofa with dried pampas grass" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="max-w-lg">
          <p className="eyebrow">The Living edit</p>
          <h2 className="display mt-4 text-[clamp(2rem,3.6vw,3rem)]">Chosen by designers, not algorithms.</h2>
          <p className="mt-6 text-stone-600 font-light leading-relaxed">
            Every piece in Atmosfere Living is something we would specify for a client&apos;s home. We work directly with makers across India —
            potters in Khurja, weavers in Bhadohi, joiners in Jodhpur — and pair their craft with a few carefully sourced icons.
          </p>
          <p className="mt-4 text-stone-600 font-light leading-relaxed">
            The result is a small, considered collection that works together, so styling a room feels less like shopping and more like finishing a thought.
          </p>
          <Link href="/shop" className="link-underline mt-10">
            Explore the edit <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section className="bg-stone-100/60 py-24 md:py-32">
        <div className="container-lux">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Featured</p>
              <h2 className="display mt-4 text-[clamp(2rem,4vw,3.25rem)]">Pieces we keep coming back to.</h2>
            </div>
            <Link href="/shop" className="link-underline">
              Shop all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} rating={ratings[p.id]} priority={i < 4} />
            ))}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="bg-charcoal py-24 text-ivory md:py-32">
        <div className="container-lux">
          <p className="eyebrow !text-stone-400">The Atmosfere promise</p>
          <h2 className="display mt-4 max-w-2xl text-[clamp(2rem,4vw,3.25rem)]">Considered from the first click to the last cushion.</h2>
          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {[
              ["01", "Designer-curated", "Every piece is selected and styled by the Atmosfere Spaces studio."],
              ["02", "Made by hand", "Small-batch makers across India, paid fairly and credited by name."],
              ["03", "White-glove delivery", "Large pieces are delivered, unboxed and placed in the room you choose."],
              ["04", "Easy returns", "Changed your mind? Return eligible pieces within 14 days of delivery."],
            ].map(([n, t, d]) => (
              <div key={n} className="flex min-h-64 flex-col justify-between rounded-[18px] border border-ivory/10 bg-ivory/[0.03] p-7">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-ivory/40 font-display text-sm">{n}</span>
                <div>
                  <h3 className="display text-2xl">{t}</h3>
                  <p className="mt-2 text-sm text-ivory/60 font-light">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Edit banner */}
      <section className="container-lux grid items-center gap-12 py-24 md:grid-cols-12 md:py-32">
        <div className="md:col-span-5 md:order-2 md:pl-10">
          <p className="eyebrow">Styling notes</p>
          <h2 className="display mt-4 text-[clamp(2rem,3.6vw,3rem)]">Warm wood, soft light, one bold colour.</h2>
          <p className="mt-6 text-stone-600 font-light leading-relaxed">
            Our favourite living rooms start with a calm base and a single confident accent — a terracotta sofa, a copper pendant, a mustard chair.
            Build around it with texture rather than more colour.
          </p>
          <Link href="/shop?category=furniture" className="link-underline mt-10">
            Shop furniture <ArrowRight size={14} />
          </Link>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] md:col-span-7 md:order-1">
          <Image src={img(EDIT, 1800)} alt="A warm living room with a statement chair" fill sizes="(min-width:768px) 58vw, 100vw" className="object-cover" />
        </div>
      </section>

      {/* Spaces CTA */}
      <section className="relative overflow-hidden bg-charcoal text-ivory">
        <Image src={img(SPACES, 2400)} alt="" fill sizes="100vw" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 to-charcoal/30" />
        <div className="container-lux relative grid gap-10 py-28 md:grid-cols-2 md:items-end">
          <h2 className="display text-[clamp(2.25rem,4.5vw,3.75rem)]">
            Want the whole room
            <br />
            done for you?
          </h2>
          <div className="space-y-6 md:justify-self-end md:max-w-sm">
            <p className="text-ivory/75 font-light">
              Atmosfere Spaces designs and builds turnkey interiors for homes and workplaces — the same team that curates this shop.
            </p>
            <a href="https://www.atmosfere.in/spaces" className="btn btn-light">
              Discover Atmosfere Spaces <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
