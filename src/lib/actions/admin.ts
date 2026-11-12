"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "./store";
import type { OrderStatus, PaymentStatus, ReviewStatus, Role } from "@/lib/types";

/** Every admin action re-checks the role server-side; RLS enforces it again in the database. */
async function admin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: me } = await supabase.from("profiles").select("role, is_blocked").eq("id", user.id).single();
  if (me?.role !== "admin" || me.is_blocked) throw new Error("Admins only");
  return { supabase, user };
}

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() ? v.trim() : null;
};
const num = (fd: FormData, k: string) => {
  const v = str(fd, k);
  return v === null ? null : Number(v);
};

// ---------------------------------------------------------------- Products
export async function saveProduct(fd: FormData): Promise<ActionResult> {
  const { supabase } = await admin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  const price = num(fd, "price");
  if (!name || price === null || Number.isNaN(price)) return { ok: false, error: "Name and price are required." };

  const images = (fd.getAll("images") as string[]).map((s) => s.trim()).filter(Boolean);
  const row = {
    name,
    slug: str(fd, "slug") ? slugify(str(fd, "slug")!) : slugify(name),
    sku: str(fd, "sku"),
    short_description: str(fd, "short_description"),
    description: str(fd, "description"),
    category_id: str(fd, "category_id"),
    price,
    compare_at_price: num(fd, "compare_at_price"),
    stock: num(fd, "stock") ?? 0,
    materials: str(fd, "materials"),
    dimensions: str(fd, "dimensions"),
    care: str(fd, "care"),
    images,
    is_active: fd.get("is_active") === "on",
    is_featured: fd.get("is_featured") === "on",
  };

  const { error } = id ? await supabase.from("products").update(row).eq("id", id) : await supabase.from("products").insert(row);
  if (error) return { ok: false, error: error.code === "23505" ? "That slug or SKU is already in use." : error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/products/${row.slug}`);
  revalidatePath("/");
  redirect("/admin/products?saved=1");
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase } = await admin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true };
}

export async function toggleProduct(id: string, field: "is_active" | "is_featured", value: boolean): Promise<ActionResult> {
  const { supabase } = await admin();
  const { error } = await supabase.from("products").update({ [field]: value }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { ok: true };
}

// -------------------------------------------------------------- Categories
export async function saveCategory(fd: FormData): Promise<ActionResult> {
  const { supabase } = await admin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name) return { ok: false, error: "Name is required." };
  const row = {
    name,
    slug: slugify(str(fd, "slug") ?? name),
    description: str(fd, "description"),
    image_url: str(fd, "image_url"),
    sort_order: num(fd, "sort_order") ?? 0,
  };
  const { error } = id ? await supabase.from("categories").update(row).eq("id", id) : await supabase.from("categories").insert(row);
  if (error) return { ok: false, error: error.code === "23505" ? "That slug is already in use." : error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { supabase } = await admin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categories");
  return { ok: true };
}

// ------------------------------------------------------------------ Orders
export async function updateOrder(
  id: string,
  patch: { status?: OrderStatus; payment_status?: PaymentStatus; tracking_number?: string | null },
): Promise<ActionResult> {
  const { supabase } = await admin();
  const { error } = await supabase.from("orders").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  return { ok: true, message: "Order updated." };
}

// ------------------------------------------------------------------- Users
export async function updateUser(id: string, patch: { role?: Role; is_blocked?: boolean }): Promise<ActionResult> {
  const { supabase, user } = await admin();
  if (id === user.id && (patch.role === "customer" || patch.is_blocked)) {
    return { ok: false, error: "You can't remove your own admin access." };
  }
  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/users");
  return { ok: true };
}

// ----------------------------------------------------------------- Reviews
export async function setReviewStatus(id: string, status: ReviewStatus): Promise<ActionResult> {
  const { supabase } = await admin();
  const { data, error } = await supabase.from("reviews").update({ status }).eq("id", id).select("product:products(slug)").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/reviews");
  const slug = (data as unknown as { product: { slug: string } | null })?.product?.slug;
  if (slug) revalidatePath(`/products/${slug}`);
  return { ok: true };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  const { supabase } = await admin();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/reviews");
  return { ok: true };
}

// --------------------------------------------------------------- Discounts
export async function saveDiscount(fd: FormData): Promise<ActionResult> {
  const { supabase } = await admin();
  const id = str(fd, "id");
  const code = str(fd, "code")?.toUpperCase().replace(/\s+/g, "");
  const value = num(fd, "value");
  const type = str(fd, "type") as "percent" | "fixed";
  if (!code || !value || value <= 0) return { ok: false, error: "Code and a positive value are required." };
  if (type === "percent" && value > 100) return { ok: false, error: "Percentage can't exceed 100." };
  const row = {
    code,
    description: str(fd, "description"),
    type,
    value,
    min_order_amount: num(fd, "min_order_amount") ?? 0,
    max_discount_amount: num(fd, "max_discount_amount"),
    usage_limit: num(fd, "usage_limit"),
    starts_at: str(fd, "starts_at") ? new Date(str(fd, "starts_at")!).toISOString() : null,
    expires_at: str(fd, "expires_at") ? new Date(str(fd, "expires_at")!).toISOString() : null,
    is_active: fd.get("is_active") === "on",
  };
  const { error } = id ? await supabase.from("discount_codes").update(row).eq("id", id) : await supabase.from("discount_codes").insert(row);
  if (error) return { ok: false, error: error.code === "23505" ? "That code already exists." : error.message };
  revalidatePath("/admin/discounts");
  return { ok: true };
}

export async function toggleDiscount(id: string, is_active: boolean): Promise<ActionResult> {
  const { supabase } = await admin();
  const { error } = await supabase.from("discount_codes").update({ is_active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/discounts");
  return { ok: true };
}

export async function deleteDiscount(id: string): Promise<ActionResult> {
  const { supabase } = await admin();
  const { error } = await supabase.from("discount_codes").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/discounts");
  return { ok: true };
}
