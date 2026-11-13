export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Atmosfere Living" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return (
    <div className="min-h-svh bg-stone-100/60 lg:grid lg:grid-cols-[260px_1fr]">
      <AdminNav name={profile.full_name ?? profile.email ?? "Admin"} />
      <div className="min-w-0 px-5 py-8 md:px-10 md:py-10">{children}</div>
    </div>
  );
}
