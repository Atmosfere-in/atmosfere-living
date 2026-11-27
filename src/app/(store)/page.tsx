import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories, getCorners, getProducts, getRatings } from "@/lib/data";
import { VibeTiles } from "@/components/vibes/VibeTiles";
import { ProductCard } from "@/components/store/ProductCard";
import { HeroScroll } from "@/components/home/HeroScroll";
import { img } from "@/lib/utils";

const STORY = "https://images.unsplash.com/photo-1578500494198-246f612d3b3d";
const EDIT = "https://images.unsplash.com/photo-1618220179428-22790b461013";
const SPACES = "https://images.unsplash.com/photo-1564078516393-cf04bd966897";

export default async function Home() {
  const [categories, featured, ratings, corners] = await Promise.all([
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
    getRatings(),
    getCorners(),
  ]);

  return (
    <>
      {/* Hero: scroll-scrubbed walk through a home */}
      <HeroScroll />

      {/* Shop by Vibe */}
      {corners.length > 0 && (
        <section className="border-y border-stone-200 bg-stone-100/60">
          <div className="container-lux py-24 md:py-32">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Shop by Vibe</p>
                <h2 className="display mt-4 max-w-2xl text-[clamp(2rem,4vw,3.25rem)]">One piece, styled your way.</h2>
                <p className="mt-4 max-w-lg text-stone-600 font-light">
                  Corners designed by our studio. Shop the complete look, or just the pieces you love.
                </p>
              </div>
              <Link href="/vibes" className="link-underline">
                All vibes <ArrowRight size={14} />
              </Link>
            </div>
            <div className="mt-14">
              <VibeTiles corners={corners} />
            </div>
          </div>
        </section>
      )}

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
            <Link key={c.id} href={`/shop?category=${c.slug}`} className={`group block img-zoom ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-[18px] bg-stone-100">
                {c.image_url && <Image src={img(c.image_url, 900)} alt={c.name} fill sizes={i === 0 ? "(min-width:768px) 20vw, 100vw" : "(min-width:768px) 20vw, 50vw"} className="object-cover" />}
              </div>
              <h3 className="display mt-4 text-2xl">{c.name}</h3>
              {c.description && <p className="mt-1 text-xs text-stone-600 font-light">{c.description}</p>}
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
      <section className="container-lux pb-24 md:pb-32">
        <div className="grid overflow-hidden rounded-[18px] bg-stone-100 md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px]">
            <Image src={img(SPACES, 1600)} alt="An interior designed by Atmosfere Spaces" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center gap-6 p-10 md:p-16">
            <h2 className="display text-[clamp(2.25rem,4vw,3.5rem)]">
              Want the whole room
              <br />
              done for you?
            </h2>
            <p className="max-w-sm text-stone-600 font-light">
              Atmosfere Spaces designs and builds turnkey interiors for homes and workplaces — the same team that curates this shop.
            </p>
            <a href="https://www.atmosfere.in/spaces" className="btn btn-dark self-start">
              Discover Atmosfere Spaces <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
