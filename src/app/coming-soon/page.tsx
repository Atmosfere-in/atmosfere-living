import type { Metadata } from "next";
import { BrandLockup } from "@/components/Logo";
import { COMING_SOON_BANNER } from "@/lib/coming-soon";

export const metadata: Metadata = {
  title: { absolute: "Atmosfere Living — Coming soon" },
  description: "Curated furniture and decor from Atmosfere. Launching soon.",
};

/** Shown for every page on atmosfere-living.in until launch (see lib/coming-soon.ts). */
export default function ComingSoon() {
  const { desktop, mobile, alt } = COMING_SOON_BANNER;

  if (desktop) {
    return (
      <main className="relative min-h-svh bg-ivory">
        <picture>
          {mobile && <source media="(max-width: 767px)" srcSet={mobile} />}
          <img src={desktop} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
        </picture>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-between bg-ivory px-[var(--gutter)] py-10 text-center text-ink">
      <BrandLockup />
      <div className="max-w-2xl">
        <p className="eyebrow rise">Launching soon</p>
        <h1 className="display mt-6 text-[clamp(3rem,8vw,6.5rem)] rise-2">Coming soon.</h1>
        <p className="mx-auto mt-6 max-w-md text-stone-600 font-light leading-relaxed rise-3">
          Furniture, lighting and objects chosen by the designers behind Atmosfere — for homes that feel quietly considered.
        </p>
      </div>
      <a href="https://www.atmosfere.in" className="text-xs tracking-[0.2em] uppercase text-stone-600 hover:text-ink">
        Visit atmosfere.in
      </a>
    </main>
  );
}
