"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import type { ShippingAddress } from "@/lib/types";

export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

const notConfigured = { ok: false as const, error: "Supabase is not configured yet. Add your keys to .env.local." };

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function toggleWishlist(productId: string): Promise<ActionResult<{ saved: boolean }>> {
  if (!isSupabaseConfigured()) return notConfigured;
  const { supabase, user } = await authed();
  if (!user) return { ok: false, error: "Please sign in to save pieces." };
  const { data: existing } = await supabase
    .from("wishlist")
    .select("product_id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();
  if (existing) {
    await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId);
  } else {
    const { error } = await supabase.from("wishlist").insert({ user_id: user.id, product_id: productId });
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/account/wishlist");
  return { ok: true, data: { saved: !existing } };
}

export async function submitReview(input: {
  productId: string;
  slug: string;
  rating: number;
  title: string;
  body: string;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured;
  const { supabase, user } = await authed();
  if (!user) return { ok: false, error: "Please sign in to write a review." };
  if (input.rating < 1 || input.rating > 5) return { ok: false, error: "Choose a rating from 1 to 5." };
  if (input.body.trim().length < 10) return { ok: false, error: "Tell us a little more (at least 10 characters)." };

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const { error } = await supabase.from("reviews").upsert(
    {
      product_id: input.productId,
      user_id: user.id,
      author_name: profile?.full_name ?? user.email?.split("@")[0] ?? "Customer",
      rating: input.rating,
      title: input.title.trim() || null,
      body: input.body.trim(),
    },
    { onConflict: "product_id,user_id" },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/products/${input.slug}`);
  return { ok: true, message: "Thank you — your review will appear once approved." };
}

export async function checkDiscount(code: string, subtotal: number): Promise<ActionResult<{ code: string; amount: number; description: string | null }>> {
  if (!isSupabaseConfigured()) return notConfigured;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("validate_discount", { p_code: code, p_subtotal: subtotal });
  if (error) return { ok: false, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.code) return { ok: false, error: row?.message ?? "This code is not valid." };
  return { ok: true, data: { code: row.code, amount: Number(row.discount_amount), description: row.description } };
}

export async function placeOrder(input: {
  items: { product_id: string; quantity: number }[];
  address: ShippingAddress;
  discountCode?: string | null;
  paymentMethod: string;
  notes?: string;
  saveAddress?: boolean;
}): Promise<ActionResult<{ id: string; orderNumber: string }>> {
  if (!isSupabaseConfigured()) return notConfigured;
  const { supabase, user } = await authed();
  if (!user) return { ok: false, error: "Please sign in to place your order." };

  const a = input.address;
  for (const k of ["full_name", "phone", "line1", "city", "state", "postal_code"] as const) {
    if (!a[k]?.trim()) return { ok: false, error: "Please complete your shipping address." };
  }
  if (!/^\d{6}$/.test(a.postal_code.trim())) return { ok: false, error: "Enter a valid 6-digit PIN code." };

  const { data, error } = await supabase.rpc("place_order", {
    p_items: input.items,
    p_shipping_address: a,
    p_discount_code: input.discountCode || null,
    p_payment_method: input.paymentMethod,
    p_notes: input.notes || null,
  });
  if (error) return { ok: false, error: error.message };

  if (input.saveAddress) {
    const { count } = await supabase.from("addresses").select("id", { count: "exact", head: true }).eq("user_id", user.id);
    await supabase.from("addresses").insert({ ...a, user_id: user.id, is_default: !count });
  }

  revalidatePath("/account/orders");
  return { ok: true, data: { id: data.id, orderNumber: data.order_number } };
}

export async function cancelOrder(orderId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured;
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_my_order", { p_order_id: orderId });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/orders");
  return { ok: true };
}

export async function saveAddress(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured;
  const { supabase, user } = await authed();
  if (!user) return { ok: false, error: "Not signed in." };
  const id = formData.get("id") as string | null;
  const row = {
    user_id: user.id,
    label: (formData.get("label") as string) || "Home",
    full_name: formData.get("full_name") as string,
    phone: formData.get("phone") as string,
    line1: formData.get("line1") as string,
    line2: (formData.get("line2") as string) || null,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    postal_code: formData.get("postal_code") as string,
    country: "India",
    is_default: formData.get("is_default") === "on",
  };
  if (!row.full_name || !row.phone || !row.line1 || !row.city || !row.state || !/^\d{6}$/.test(row.postal_code ?? "")) {
    return { ok: false, error: "Please fill all required fields (PIN code must be 6 digits)." };
  }
  if (row.is_default) await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  const { error } = id
    ? await supabase.from("addresses").update(row).eq("id", id).eq("user_id", user.id)
    : await supabase.from("addresses").insert(row);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured;
  const { supabase, user } = await authed();
  if (!user) return { ok: false, error: "Not signed in." };
  await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured;
  const { supabase, user } = await authed();
  if (!user) return { ok: false, error: "Not signed in." };
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: (formData.get("full_name") as string)?.trim() || null, phone: (formData.get("phone") as string)?.trim() || null })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/account", "layout");
  return { ok: true, message: "Profile saved." };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutAdmin() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/admin/login");
}
