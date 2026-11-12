import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLockup } from "@/components/Logo";
import { LoginButtons } from "@/components/auth/LoginButtons";
import { getSession } from "@/lib/auth";
import { img, isSupabaseConfigured } from "@/lib/utils";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const { user } = await getSession();
  if (user) redirect(safeNext);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-charcoal lg:block">
        <Image src={img("https://images.unsplash.com/photo-1616486338812-3dadae4b4ace", 1800)} alt="" fill priority sizes="50vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
        <div className="absolute inset-x-12 bottom-12 text-ivory">
          <p className="eyebrow !text-ivory/70">Atmosfere Living</p>
          <p className="display mt-4 max-w-md text-4xl">Your orders, wishlist and saved addresses — all in one place.</p>
        </div>
      </div>

      <div className="flex flex-col px-[var(--gutter)] py-10">
        <Link href="/" className="self-start">
          <BrandLockup />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-16">
          <p className="eyebrow">Welcome</p>
          <h1 className="display mt-4 text-5xl">Sign in</h1>
          <p className="mt-4 text-stone-600 font-light">Sign in or create an account to check out, track orders and save pieces you love.</p>

          {error && <p className="mt-6 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-800">We couldn&apos;t sign you in. Please try again.</p>}
          {!isSupabaseConfigured() && (
            <p className="mt-6 rounded-sm bg-stone-100 px-4 py-3 text-sm text-stone-600">
              Supabase isn&apos;t connected yet — add your keys to <code>.env.local</code> to enable sign-in.
            </p>
          )}

          <div className="mt-10">
            <LoginButtons next={safeNext} />
          </div>

          <p className="mt-10 text-xs leading-relaxed text-stone-400">
            By continuing you agree to our terms of sale and privacy policy.
          </p>
        </div>
        <Link href="/shop" className="text-sm text-stone-600 hover:text-ink">
          ← Continue shopping
        </Link>
      </div>
    </div>
  );
}
