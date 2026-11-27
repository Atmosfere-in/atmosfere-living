import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { img } from "@/lib/utils";
import type { VibeCorner } from "@/lib/types";

/**
 * Homepage "Shop by Vibe": four large images in a 2×2 grid. On hover the name and details rise in;
 * on touch screens (no hover) they show all the time.
 */
export function VibeGrid({ corners }: { corners: VibeCorner[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:gap-5">
      {corners.slice(0, 4).map((c, i) => {
        const pieces = c.items?.length ?? 0;
        return (
          <Link
            key={c.id}
            href={`/vibes/${c.slug}`}
            className="group relative block aspect-[1246/1120] overflow-hidden rounded-[18px] bg-stone-100"
          >
            <Image
              src={img(c.image, 1800)}
              alt={`${c.name} corner`}
              fill
              sizes="(min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-[1400ms] ease-lux group-hover:scale-[1.06]"
            />

            {/* Gentle shade at the foot, deepening on hover so the details read clearly */}
            <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 via-black/15 to-transparent transition-opacity duration-700 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100" />

            {/* Number, always visible */}
            <span className="absolute left-5 top-5 rounded-full bg-ivory/85 px-3 py-1 text-[0.62rem] tracking-[0.24em] backdrop-blur md:left-6 md:top-6">
              {String(i + 1).padStart(2, "0")}
            </span>

            {/* Name and details: rise in on hover (always shown on touch screens) */}
            <span className="absolute inset-x-5 bottom-5 text-ivory transition-[opacity,transform] duration-700 ease-lux md:inset-x-7 md:bottom-7 [@media(hover:hover)]:translate-y-4 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
              <span className="block text-[0.62rem] tracking-[0.28em] uppercase text-ivory/80">
                {pieces} piece{pieces === 1 ? "" : "s"} to shop
              </span>
              <span className="display mt-2 block text-[clamp(1.75rem,3vw,2.75rem)]">{c.name}</span>
              {c.tagline && <span className="mt-1 block max-w-sm text-sm font-light text-ivory/85">{c.tagline}</span>}
              <span className="mt-4 inline-flex items-center gap-2 border-b border-ivory/60 pb-1 text-[0.68rem] font-medium tracking-[0.2em] uppercase">
                Shop the corner <ArrowRight size={13} />
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
