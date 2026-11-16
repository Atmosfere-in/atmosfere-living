import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { img } from "@/lib/utils";
import type { VibeCorner } from "@/lib/types";

/** A row of corner tiles. Swipes sideways on phones, sits in a grid from tablet up. */
export function VibeTiles({ corners, size = "lg" }: { corners: VibeCorner[]; size?: "lg" | "sm" }) {
  return (
    <div className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
      {corners.map((c, i) => (
        <Link key={c.id} href={`/vibes/${c.slug}`} className="group w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto img-zoom">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-stone-100">
            <Image
              src={img(c.image, 1400)}
              alt={`${c.name} corner`}
              fill
              sizes="(min-width:1024px) 25vw, (min-width:768px) 50vw, 80vw"
              className="object-cover"
            />
          </div>
          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.62rem] tracking-[0.28em] uppercase text-stone-400">{String(i + 1).padStart(2, "0")}</p>
              <h3 className={size === "lg" ? "display mt-2 text-3xl" : "display mt-2 text-2xl"}>{c.name}</h3>
              {c.tagline && <p className="mt-1 text-sm text-stone-600 font-light">{c.tagline}</p>}
            </div>
            <span className="mt-7 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-stone-200 transition-colors duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-ivory">
              <ArrowRight size={14} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
