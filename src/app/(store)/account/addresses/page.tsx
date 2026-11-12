import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AddressManager } from "@/components/account/AddressManager";
import type { Address } from "@/lib/types";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const { user } = await requireUser("/account/addresses");
  const supabase = await createClient();
  const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at");
  return (
    <div>
      <h2 className="display text-3xl">Addresses</h2>
      <div className="mt-6">
        <AddressManager addresses={(data as Address[]) ?? []} />
      </div>
    </div>
  );
}
