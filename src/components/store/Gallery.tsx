"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cx, img } from "@/lib/utils";

/** Technical drawings are shown whole on a paper tone; photos fill their frame. */
const isDrawing = (src: string) => /drawing/i.test(src);

/**
 * Product photos.
 * Desktop: the images run down the page (first one large, then pairs) while the details column stays in view.
 * Phones: a swipeable row with dots.
 */
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const list = images.length ? images : [""];
  const [at, setAt] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const alt = (i: number, src: string) => (isDrawing(src) ? `${name} — dimensions drawing` : i === 0 ? name : `${name} — view ${i + 1}`);

  return (
    <>
      {/* Phones: swipe */}
      <div className="lg:hidden">
        <div
          ref={rowRef}
          onScroll={(e) => setAt(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="-mx-[var(--gutter)] flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        >
          {list.map((src, i) => (
            <div key={src + i} className="w-full shrink-0 snap-center px-[var(--gutter)]">
              <div className={cx("relative aspect-[4/5] overflow-hidden rounded-[18px]", isDrawing(src) ? "bg-[#fbf9f5]" : "bg-stone-100")}>
                <Image src={img(src, 1200)} alt={alt(i, src)} fill priority={i === 0} sizes="100vw" className={isDrawing(src) ? "object-contain p-3" : "object-cover"} />
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

      {/* Desktop: stacked */}
      <div className="hidden grid-cols-2 gap-4 lg:grid">
        {list.map((src, i) => {
          const drawing = isDrawing(src);
          // First image and drawings span the full width; an odd photo left alone at the end does too.
          const photosBefore = list.slice(1, i).filter((s) => !isDrawing(s)).length;
          const lastOdd = !drawing && i > 0 && photosBefore % 2 === 0 && (i === list.length - 1 || isDrawing(list[i + 1]));
          const wide = i === 0 || drawing || lastOdd;
          return (
            <figure key={src + i} className={cx("relative overflow-hidden rounded-[18px]", wide ? "col-span-2" : "", drawing ? "bg-[#fbf9f5] ring-1 ring-stone-200" : "bg-stone-100")}>
              <div className={cx("relative", drawing ? "aspect-[5/4]" : i === 0 ? "aspect-[4/5]" : wide ? "aspect-[3/2]" : "aspect-[4/5]")}>
                <Image
                  src={img(src, 1800)}
                  alt={alt(i, src)}
                  fill
                  priority={i === 0}
                  sizes={wide ? "(min-width:1024px) 55vw, 100vw" : "(min-width:1024px) 28vw, 50vw"}
                  className={drawing ? "object-contain p-4" : "object-cover"}
                />
              </div>
              {drawing && <figcaption className="border-t border-stone-200 px-5 py-3 text-[0.65rem] tracking-[0.2em] uppercase text-stone-600">Dimensions · all measurements in mm</figcaption>}
            </figure>
          );
        })}
      </div>
    </>
  );
}
