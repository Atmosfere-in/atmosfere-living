"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cx, img } from "@/lib/utils";

/**
 * Product photos.
 * Desktop: an image grid sized to the screen — one large photo on top, the rest in a row below.
 * Clicking a small photo swaps it into the large slot. The grid stays in view while the details scroll.
 * Phones: a swipeable row with dots.
 */
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const photos = images.filter((s) => !/drawing/i.test(s)); // technical drawings are not shown in the store
  const list = photos.length ? photos : [""];
  const [main, setMain] = useState(0);
  const [at, setAt] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const alt = (i: number) => (i === 0 ? name : `${name} — view ${i + 1}`);
  const rest = list.map((_, i) => i).filter((i) => i !== main).slice(0, 4);

  return (
    <>
      {/* Phones and tablets: swipe */}
      <div className="lg:hidden">
        <div
          ref={rowRef}
          onScroll={(e) => setAt(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="-mx-[var(--gutter)] flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        >
          {list.map((src, i) => (
            <div key={src + i} className="w-full shrink-0 snap-center px-[var(--gutter)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-stone-100">
                <Image src={img(src, 1400)} alt={alt(i)} fill priority={i === 0} sizes="100vw" className="object-cover" />
              </div>
            </div>
          ))}
        </div>
        {list.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {list.map((src, i) => (
              <button
                key={src + i}
                aria-label={`Show image ${i + 1}`}
                onClick={() => rowRef.current?.scrollTo({ left: i * rowRef.current.clientWidth, behavior: "smooth" })}
                className={cx("h-1.5 rounded-full transition-all duration-500 cursor-pointer", i === at ? "w-6 bg-ink" : "w-1.5 bg-stone-400")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: image grid that fits the screen */}
      <div
        className={cx(
          "hidden h-[min(calc(100svh-var(--header-height)-4.5rem),900px)] min-h-[480px] gap-3 lg:grid",
          rest.length ? "grid-rows-[minmax(0,2.1fr)_minmax(0,1fr)]" : "grid-rows-1",
        )}
      >
        <div className="relative overflow-hidden rounded-[18px] bg-stone-100">
          {list.map((src, i) => (
            <Image
              key={src + i}
              src={img(src, 1800)}
              alt={alt(i)}
              fill
              priority={i === 0}
              sizes="(min-width:1024px) 58vw, 100vw"
              className={cx("object-cover transition-opacity duration-700", i === main ? "opacity-100" : "opacity-0")}
            />
          ))}
        </div>
        {rest.length > 0 && (
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${rest.length}, minmax(0, 1fr))` }}>
            {rest.map((i) => (
              <button
                key={list[i] + i}
                onClick={() => setMain(i)}
                aria-label={`View image ${i + 1} large`}
                className="group relative overflow-hidden rounded-[14px] bg-stone-100 cursor-pointer"
              >
                <Image
                  src={img(list[i], 900)}
                  alt={alt(i)}
                  fill
                  sizes="(min-width:1024px) 20vw, 33vw"
                  className="object-cover transition-transform duration-[1200ms] ease-lux group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
