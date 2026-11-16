import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCornerBySlug, getCorners } from "@/lib/data";
import { CornerShop } from "@/components/vibes/CornerShop";
import { VibeTiles } from "@/components/vibes/VibeTiles";
import { img } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const corner = await getCornerBySlug(slug);
  if (!corner) return { title: "Not found" };
  return {
    title: `${corner.name} corner · Shop by Vibe`,
    description: corner.tagline ?? corner.story ?? undefined,
    openGraph: { images: [img(corner.image, 1200)] },
  };
}

export default async function CornerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [corner, all] = await Promise.all([getCornerBySlug(slug), getCorners()]);
  if (!corner) notFound();
  const others = all.filter((c) => c.id !== corner.id);

  return (
    <>
      <div className="container-lux pt-8 md:pt-12">
        <nav className="text-xs tracking-[0.14em] uppercase text-stone-400" aria-label="Breadcrumb">
          <Link href="/vibes" className="hover:text-ink">
            Shop by Vibe
          </Link>
          {" / "}
          <span className="text-ink">{corner.name}</span>
        </nav>
      </div>

      <CornerShop corner={corner} />

      {others.length > 0 && (
        <section className="container-lux border-t border-stone-200 py-24">
          <p className="eyebrow">Explore other vibes</p>
          <h2 className="display mt-4 text-[clamp(2rem,3.5vw,3rem)]">Same piece, another mood.</h2>
          <div className="mt-12">
            <VibeTiles corners={others} size="sm" />
          </div>
        </section>
      )}
    </>
  );
}
