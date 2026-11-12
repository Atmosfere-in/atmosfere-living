"use client";

import Image from "next/image";
import { useState } from "react";
import { cx, img } from "@/lib/utils";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const list = images.length ? images : [""];
  const [i, setI] = useState(0);
  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {list.length > 1 && (
        <div className="flex gap-3 md:flex-col">
          {list.map((src, idx) => (
            <button
              key={src + idx}
              onClick={() => setI(idx)}
              aria-label={`View image ${idx + 1}`}
              className={cx(
                "relative h-24 w-20 overflow-hidden rounded-lg bg-stone-100 transition-opacity cursor-pointer",
                idx === i ? "ring-1 ring-ink" : "opacity-60 hover:opacity-100",
              )}
            >
              <Image src={img(src, 200)} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-[18px] bg-stone-100">
        {list.map((src, idx) => (
          <Image
            key={src + idx}
            src={img(src, 1600)}
            alt={idx === 0 ? name : `${name} — view ${idx + 1}`}
            fill
            priority={idx === 0}
            sizes="(min-width:1024px) 55vw, 100vw"
            className={cx("object-cover transition-opacity duration-700", idx === i ? "opacity-100" : "opacity-0")}
          />
        ))}
      </div>
    </div>
  );
}
