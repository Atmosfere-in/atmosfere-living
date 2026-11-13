import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLockup } from "@/components/Logo";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";

  const { user, profile } = await getSession();
  if (user && profile?.role === "admin" && !profile.is_blocked) redirect(safeNext);
  const signedInAsCustomer = !!user && profile?.role !== "admin";

  return (
    <div className="flex min-h-svh flex-col bg-charcoal px-[var(--gutter)] py-10 text-ivory">
      <div className="flex items-center gap-3">
        <BrandLockup />
        <span className="badge bg-ivory/10 text-ivory/70">Admin</span>
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-16">
        <p className="eyebrow !text-stone-400">Staff only</p>
        <h1 className="display mt-4 text-5xl">Admin sign in</h1>
        <p className="mt-4 text-ivory/60 font-light">Manage products, orders, customers and offers for Atmosfere Living.</p>

        {(error === "not_admin" || signedInAsCustomer) && (
          <p className="mt-6 rounded-sm bg-red-950/60 px-4 py-3 text-sm text-red-200">
            This account doesn&apos;t have admin access. Sign in with an admin account.
          </p>
        )}

        <div className="mt-10">
          <AdminLoginForm next={safeNext} signedIn={!!user} />
        </div>
      </div>

      <Link href="/" className="text-sm text-ivory/50 hover:text-ivory">
        ← Back to the store
      </Link>
    </div>
  );
}
