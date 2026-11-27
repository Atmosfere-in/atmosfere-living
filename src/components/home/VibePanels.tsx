"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cx, img } from "@/lib/utils";
import type { VibeCorner } from "@/lib/types";

/**
 * Homepage "Shop by Vibe" as expanding panels: the corners stand side by side as tall slices;
 * the one you point at opens up with its story, the rest narrow to a vertical title.
 * On phones the same idea stacks vertically: tap a title to open it.
 */
export function VibePanels({ corners }: { corners: VibeCorner[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex h-[min(78svh,760px)] min-h-[560px] flex-col gap-2 md:flex-row md:gap-3">
      {corners.map((c, i) => {
        const open = i === active;
        const pieces = c.items?.length ?? 0;
        return (
          <div
            key={c.id}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className={cx(
              "group relative overflow-hidden rounded-[18px] bg-stone-100 transition-[flex-grow] duration-[900ms] ease-lux",
              open ? "grow-[6] cursor-default" : "grow cursor-pointer",
            )}
            style={{ flexBasis: 0 }}
          >
            <Image
              src={img(c.image, 2000)}
              alt={`${c.name} corner`}
              fill
              sizes="(min-width:768px) 70vw, 100vw"
              className={cx("object-cover transition-transform duration-[1400ms] ease-lux", open ? "scale-100" : "scale-110")}
            />
            {/* Soft veil so collapsed slices read as one calm strip */}
            <span className={cx("absolute inset-0 bg-ivory/30 transition-opacity duration-700", open ? "opacity-0" : "opacity-100")} />

            {/* Collapsed: number + title (vertical on desktop) */}
            <span
              className={cx(
                "absolute flex items-center gap-3 transition-opacity duration-500",
                "left-4 top-1/2 -translate-y-1/2 md:left-1/2 md:top-6 md:-translate-x-1/2 md:translate-y-0 md:flex-col",
                open ? "pointer-events-none opacity-0" : "opacity-100",
              )}
            >
              <span className="rounded-full bg-ivory/85 px-2.5 py-1 text-[0.6rem] tracking-[0.2em] backdrop-blur">{String(i + 1).padStart(2, "0")}</span>
              <span className="rounded-full bg-ivory/85 px-3 py-1.5 font-display text-lg backdrop-blur md:px-1.5 md:py-3 md:[writing-mode:vertical-rl]">{c.name}</span>
            </span>

            {/* Open: the story card */}
            <div
              className={cx(
                "absolute inset-x-3 bottom-3 max-w-md rounded-[14px] bg-ivory/90 p-5 backdrop-blur-md transition-[opacity,transform] duration-700 ease-lux md:inset-x-auto md:bottom-6 md:left-6 md:p-7",
                open ? "translate-y-0 opacity-100 delay-300" : "pointer-events-none translate-y-4 opacity-0",
              )}
            >
              <p className="text-[0.62rem] tracking-[0.28em] uppercase text-stone-600">
                {String(i + 1).padStart(2, "0")} · {pieces} piece{pieces === 1 ? "" : "s"}
              </p>
              <h3 className="display mt-2 text-3xl md:text-4xl">{c.name}</h3>
              {c.tagline && <p className="mt-2 text-sm text-stone-600 font-light">{c.tagline}</p>}
              <Link href={`/vibes/${c.slug}`} tabIndex={open ? 0 : -1} className="btn btn-dark mt-5 !min-h-10 !px-5">
                Shop the corner <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
