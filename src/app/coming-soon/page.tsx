import type { Metadata } from "next";
import Image from "next/image";
import { COMING_SOON_BANNER } from "@/lib/coming-soon";

export const metadata: Metadata = {
  title: { absolute: "Atmosfere Living — Coming soon" },
  description: "Curated furniture and decor from Atmosfere. Launching soon.",
  openGraph: { images: [COMING_SOON_BANNER] },
};

const ALT = "Atmosfere Living — coming soon. A warm living room with a curved sofa, travertine table and wooden shelves.";

/**
 * Shown for every page on atmosfere-living.in until launch (see lib/coming-soon.ts).
 * Wide screens show the banner full-bleed. Phones and portrait tablets would crop its lettering,
 * so they get the same title set in the site's fonts above the room part of the banner.
 */
export default function ComingSoon() {
  return (
    <main className="min-h-svh bg-[#efe3d2] text-[#433a26]">
      {/* Wide, landscape screens: the banner as designed */}
      <div className="relative hidden h-svh md:landscape:block">
        <Image src={COMING_SOON_BANNER} alt={ALT} fill priority sizes="100vw" className="object-cover object-left" />
      </div>

      {/* Phones and portrait screens: title above, the room below */}
      <div className="flex min-h-svh flex-col md:landscape:hidden">
        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#f1e6d7] to-[#e8d6bf] px-6 pb-12 pt-16 text-center">
          <h1 className="font-display text-[clamp(3rem,15vw,5.5rem)] leading-none tracking-[0.18em] pl-[0.18em] rise">LIVING</h1>
          <span className="mt-7 h-px w-24 bg-[#433a26]/50 rise-2" />
          <p className="mt-6 text-[0.72rem] font-medium tracking-[0.45em] pl-[0.45em] uppercase rise-2">Coming soon</p>
        </div>
        <div className="relative min-h-[50svh] flex-1">
          <Image src={COMING_SOON_BANNER} alt={ALT} fill priority sizes="(max-width: 767px) 200vw, 120vw" className="object-cover object-[70%_50%]" />
        </div>
      </div>
    </main>
  );
}
