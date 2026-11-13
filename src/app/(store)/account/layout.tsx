import { requireUser } from "@/lib/auth";
import { AccountNav } from "@/components/account/AccountNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUser("/account");
  const name = profile?.full_name ?? user.email?.split("@")[0] ?? "there";

  return (
    <div className="container-lux pb-28 pt-16 md:pt-20">
      <p className="eyebrow">My account</p>
      <h1 className="display mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)]">Hello, {name.split(" ")[0]}.</h1>
      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <AccountNav />
        </aside>
        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
