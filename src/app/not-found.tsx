import Link from "next/link";
import { BrandLockup } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col bg-ivory px-[var(--gutter)] py-10 text-ink">
      <Link href="/">
        <BrandLockup />
      </Link>
      <div className="flex flex-1 flex-col justify-center">
        <p className="eyebrow">404</p>
        <h1 className="display mt-4 text-[clamp(2.5rem,6vw,5rem)]">This corner is empty.</h1>
        <p className="mt-4 max-w-md text-stone-600 font-light">The page you&apos;re looking for has moved or no longer exists.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/shop" className="btn btn-dark">
            Explore the shop
          </Link>
          <Link href="/" className="btn btn-outline">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
