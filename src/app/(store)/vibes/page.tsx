import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCorners } from "@/lib/data";
import { img, inr, priceWithOptions, initialChoices } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop by Vibe",
  description: "Corners styled by the Atmosfere studio — Bohemian, Modern Minimal, Maximalist and Coastal. Shop the whole corner or the pieces you love.",
};

export default async function VibesPage() {
  const corners = await getCorners();

  return (
    <>
      <section className="container-lux pb-12 pt-14 md:pb-20 md:pt-20">
        <p className="eyebrow">Shop by Vibe</p>
        <h1 className="display mt-5 max-w-4xl text-[clamp(2.75rem,6vw,5.5rem)]">One piece, styled your way.</h1>
        <p className="mt-6 max-w-xl text-stone-600 font-light leading-relaxed">
          Each corner is designed by the Atmosfere studio around our pieces. Find the mood that feels like home, then shop the complete corner or just
          the pieces you love.
        </p>
      </section>

      {corners.length === 0 ? (
        <p className="container-lux pb-32 text-stone-600">New corners are being styled. Check back soon.</p>
      ) : (
        <div className="container-lux space-y-24 pb-28 md:space-y-36 md:pb-36">
          {corners.map((c, i) => {
            const pieces = c.items ?? [];
            const total = pieces
              .filter((it) => it.product && !it.product.is_coming_soon && it.product.stock > 0)
              .reduce((s, it) => s + priceWithOptions(it.product!.price, it.product!.options, initialChoices(it.product!.options, it.default_options)), 0);
            return (
              <article key={c.id} className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
                <Link href={`/vibes/${c.slug}`} className={`img-zoom block md:col-span-7 ${i % 2 ? "md:order-2" : ""}`}>
                  <div className="relative aspect-[1246/1120] overflow-hidden rounded-[18px] bg-stone-100">
                    <Image src={img(c.image, 2000)} alt={`${c.name} corner`} fill sizes="(min-width:768px) 58vw, 100vw" className="object-cover" />
                  </div>
                </Link>
                <div className="md:col-span-5">
                  <p className="text-[0.62rem] tracking-[0.28em] uppercase text-stone-400">
                    {String(i + 1).padStart(2, "0")} · {pieces.length} pieces
                  </p>
                  <h2 className="display mt-4 text-[clamp(2.25rem,4vw,3.5rem)]">{c.name}</h2>
                  {c.tagline && <p className="mt-3 font-display text-xl text-stone-600">{c.tagline}</p>}
                  {c.story && <p className="mt-6 text-stone-600 font-light leading-relaxed">{c.story}</p>}
                  <div className="mt-8 flex -space-x-3">
                    {pieces.slice(0, 5).map((it) => (
                      <span key={it.id} className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-ivory bg-stone-100">
                        <Image src={img(it.product!.images[0], 200)} alt="" fill sizes="48px" className="object-cover" />
                      </span>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap items-center gap-6">
                    <Link href={`/vibes/${c.slug}`} className="btn btn-dark">
                      Shop the corner <ArrowRight size={14} />
                    </Link>
                    {total > 0 && <span className="text-sm text-stone-600">Complete corner {inr(total)}</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
