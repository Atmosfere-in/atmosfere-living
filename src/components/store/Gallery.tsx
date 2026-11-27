"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cx, img } from "@/lib/utils";

/**
 * Product photos.
 * Desktop: one large frame with thumbnails; the whole gallery stays in view while the details scroll beside it.
 * Phones: a swipeable row with dots.
 * Every photo is shown whole (never cropped) over a soft blurred copy of itself, so wide and tall shots sit in the same frame.
 */
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const photos = images.filter((s) => !/drawing/i.test(s)); // technical drawings are not shown in the store
  const list = photos.length ? photos : [""];
  const [at, setAt] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const alt = (i: number) => (i === 0 ? name : `${name} — view ${i + 1}`);

  const frame = (src: string, i: number, sizes: string) => (
    <>
      <Image src={img(src, 400)} alt="" aria-hidden fill sizes="20vw" className="scale-125 object-cover opacity-60 blur-2xl" />
      <Image src={img(src, 1800)} alt={alt(i)} fill priority={i === 0} sizes={sizes} className="object-contain" />
    </>
  );

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
              <div className="relative aspect-square overflow-hidden rounded-[18px] bg-stone-100 sm:aspect-[4/3]">
                {frame(src, i, "100vw")}
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

      {/* Desktop: one frame sized to the screen, thumbnails below */}
      <div className="hidden lg:block">
        <div className="relative h-[min(calc(100svh-var(--header-height)-10.5rem),820px)] min-h-[420px] overflow-hidden rounded-[18px] bg-stone-100">
          {list.map((src, i) => (
            <div key={src + i} className={cx("absolute inset-0 transition-opacity duration-700", i === at ? "opacity-100" : "pointer-events-none opacity-0")}>
              {frame(src, i, "(min-width:1024px) 58vw, 100vw")}
            </div>
          ))}
        </div>
        {list.length > 1 && (
          <div className="mt-4 flex gap-3">
            {list.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setAt(i)}
                onMouseEnter={() => setAt(i)}
                aria-label={`View image ${i + 1}`}
                className={cx(
                  "relative h-20 w-24 overflow-hidden rounded-lg bg-stone-100 transition-opacity cursor-pointer xl:h-24 xl:w-28",
                  i === at ? "ring-1 ring-ink ring-offset-2 ring-offset-ivory" : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={img(src, 300)} alt="" fill sizes="112px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
