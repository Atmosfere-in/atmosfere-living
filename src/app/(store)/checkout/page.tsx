import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import type { Address } from "@/lib/types";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const { user, profile } = await requireUser("/checkout");
  const supabase = await createClient();
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  return (
    <div className="container-lux pb-28 pt-16 md:pt-24">
      <p className="eyebrow">Checkout</p>
      <h1 className="display mt-4 text-[clamp(2.5rem,5vw,4rem)]">Almost home.</h1>
      <CheckoutForm
        addresses={(addresses as Address[]) ?? []}
        defaults={{ full_name: profile?.full_name ?? "", phone: profile?.phone ?? "" }}
        email={user.email ?? ""}
      />
    </div>
  );
}
