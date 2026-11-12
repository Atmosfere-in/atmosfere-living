export const dynamic = "force-dynamic";

import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getSession } from "@/lib/auth";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = await getSession();
  const headerUser = user ? { name: profile?.full_name ?? null, isAdmin: profile?.role === "admin" } : null;
  return (
    <>
      <Header user={headerUser} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
