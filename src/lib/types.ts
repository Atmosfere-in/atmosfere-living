export type Role = "customer" | "admin";
export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: Role;
  is_blocked: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sku: string | null;
  images: string[];
  materials: string | null;
  dimensions: string | null;
  care: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  category?: Pick<Category, "name" | "slug"> | null;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export type ShippingAddress = Omit<Address, "id" | "user_id" | "is_default" | "label">;

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  subtotal: number;
  discount_code: string | null;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  shipping_address: ShippingAddress;
  notes: string | null;
  tracking_number: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: ReviewStatus;
  created_at: string;
  product?: Pick<Product, "name" | "slug"> | null;
}

export interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  type: "percent" | "fixed";
  value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}
