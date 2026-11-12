import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { img, inr } from "@/lib/utils";
import { Stars } from "./Stars";

export function ProductCard({ product, rating, priority }: { product: Product; rating?: { avg: number; count: number }; priority?: boolean }) {
  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const second = product.images[1];
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-stone-100">
        <Image
          src={img(product.images[0], 900)}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-all duration-[1400ms] ease-lux group-hover:scale-[1.04]"
        />
        {second && (
          <Image
            src={img(second, 900)}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {onSale && <span className="badge bg-ivory/90 text-accent">Offer</span>}
          {product.stock === 0 && <span className="badge bg-charcoal text-ivory">Sold out</span>}
          {product.stock > 0 && product.stock <= 3 && <span className="badge bg-ivory/90">Only {product.stock} left</span>}
        </div>
      </div>
      <div className="mt-4 space-y-1">
        {product.category && <p className="text-[0.65rem] tracking-[0.24em] uppercase text-stone-400">{product.category.name}</p>}
        <h3 className="font-display text-lg leading-snug">{product.name}</h3>
        <div className="flex items-center gap-3 text-sm">
          <span>{inr(product.price)}</span>
          {onSale && <span className="text-stone-400 line-through">{inr(product.compare_at_price)}</span>}
        </div>
        {rating && rating.count > 0 && (
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <Stars value={rating.avg} size={11} /> ({rating.count})
          </div>
        )}
      </div>
    </Link>
  );
}
