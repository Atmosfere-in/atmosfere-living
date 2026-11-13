-- =====================================================================
-- Atmosfere Living — database schema
-- Run in Supabase SQL editor (or `supabase db push`).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('unpaid', 'paid', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type discount_type as enum ('percent', 'fixed');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role user_role not null default 'customer',
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admin check used by RLS. SECURITY DEFINER avoids recursive RLS on profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and not is_blocked
  );
$$;

-- True for requests from website users: the Data API connects as `authenticator` and switches
-- to anon/authenticated. False for the SQL editor and migrations, which may manage roles.
create or replace function public.is_end_user()
returns boolean
language sql
stable
as $$
  select session_user = 'authenticator' and coalesce(auth.role(), 'anon') <> 'service_role';
$$;

-- Create a profile row on sign-up (Google or email)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Non-admins may not change their own role / blocked flag
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_end_user() and not public.is_admin() then
    new.role := old.role;
    new.is_blocked := old.is_blocked;
    new.email := old.email;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ---------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price >= 0),
  stock int not null default 0 check (stock >= 0),
  sku text unique,
  images text[] not null default '{}',
  materials text,
  dimensions text,
  care text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (is_active, created_at desc);

-- ---------------------------------------------------------------------
-- Customer data
-- ---------------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text default 'Home',
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses (user_id);

create table if not exists public.wishlist (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- Discounts / offers
-- ---------------------------------------------------------------------
create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  type discount_type not null default 'percent',
  value numeric(12, 2) not null check (value > 0),
  min_order_amount numeric(12, 2) not null default 0,
  max_discount_amount numeric(12, 2),
  usage_limit int,
  used_count int not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------
create sequence if not exists public.order_number_seq start 10001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('AL' || nextval('public.order_number_seq')::text),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',
  payment_method text not null default 'cod',
  payment_reference text,
  subtotal numeric(12, 2) not null,
  discount_code text,
  discount_amount numeric(12, 2) not null default 0,
  shipping_fee numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  shipping_address jsonb not null,
  notes text,
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price numeric(12, 2) not null,
  quantity int not null check (quantity > 0)
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  status review_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index if not exists reviews_product_idx on public.reviews (product_id, status);

-- Non-admins can't self-approve
create or replace function public.protect_review_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_end_user() and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending';
      new.user_id := auth.uid();
    else
      new.status := 'pending'; -- edits go back to moderation
      new.user_id := old.user_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_protect on public.reviews;
create trigger reviews_protect
  before insert or update on public.reviews
  for each row execute function public.protect_review_status();

-- updated_at helpers
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- Public rating summary view
create or replace view public.product_ratings
with (security_invoker = true) as
  select product_id, round(avg(rating)::numeric, 1) as avg_rating, count(*)::int as review_count
  from public.reviews
  where status = 'approved'
  group by product_id;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlist enable row level security;
alter table public.discount_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

-- profiles
drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles: update own or admin" on public.profiles;
create policy "profiles: update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- categories
drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read" on public.categories for select using (true);
drop policy if exists "categories: admin write" on public.categories;
create policy "categories: admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- products
drop policy if exists "products: public read active" on public.products;
create policy "products: public read active" on public.products
  for select using (is_active or public.is_admin());
drop policy if exists "products: admin write" on public.products;
create policy "products: admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- addresses
drop policy if exists "addresses: own" on public.addresses;
create policy "addresses: own" on public.addresses
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- wishlist
drop policy if exists "wishlist: own" on public.wishlist;
create policy "wishlist: own" on public.wishlist
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- discount codes: admin only (customers validate via RPC)
drop policy if exists "discounts: admin" on public.discount_codes;
create policy "discounts: admin" on public.discount_codes
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: read own; inserts happen via place_order(); admin manages
drop policy if exists "orders: read own or admin" on public.orders;
create policy "orders: read own or admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders: admin update" on public.orders;
create policy "orders: admin update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "orders: admin delete" on public.orders;
create policy "orders: admin delete" on public.orders
  for delete using (public.is_admin());

drop policy if exists "order_items: read own or admin" on public.order_items;
create policy "order_items: read own or admin" on public.order_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- reviews
drop policy if exists "reviews: read approved, own, admin" on public.reviews;
create policy "reviews: read approved, own, admin" on public.reviews
  for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());
drop policy if exists "reviews: insert own" on public.reviews;
create policy "reviews: insert own" on public.reviews
  for insert with check (auth.uid() is not null and user_id = auth.uid());
drop policy if exists "reviews: update own or admin" on public.reviews;
create policy "reviews: update own or admin" on public.reviews
  for update using (user_id = auth.uid() or public.is_admin());
drop policy if exists "reviews: delete own or admin" on public.reviews;
create policy "reviews: delete own or admin" on public.reviews
  for delete using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- RPC: validate a discount code against a subtotal
-- ---------------------------------------------------------------------
create or replace function public.validate_discount(p_code text, p_subtotal numeric)
returns table (code text, description text, discount_amount numeric, message text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  d public.discount_codes;
  amt numeric;
begin
  select * into d from public.discount_codes
  where upper(discount_codes.code) = upper(trim(p_code));

  if not found or not d.is_active then
    return query select null::text, null::text, 0::numeric, 'This code is not valid.'; return;
  end if;
  if d.starts_at is not null and now() < d.starts_at then
    return query select null::text, null::text, 0::numeric, 'This code is not active yet.'; return;
  end if;
  if d.expires_at is not null and now() > d.expires_at then
    return query select null::text, null::text, 0::numeric, 'This code has expired.'; return;
  end if;
  if d.usage_limit is not null and d.used_count >= d.usage_limit then
    return query select null::text, null::text, 0::numeric, 'This code has reached its usage limit.'; return;
  end if;
  if p_subtotal < d.min_order_amount then
    return query select null::text, null::text, 0::numeric,
      'Minimum order of ₹' || to_char(d.min_order_amount, 'FM99,99,999') || ' required.'; return;
  end if;

  if d.type = 'percent' then
    amt := round(p_subtotal * d.value / 100, 2);
  else
    amt := d.value;
  end if;
  if d.max_discount_amount is not null then amt := least(amt, d.max_discount_amount); end if;
  amt := least(amt, p_subtotal);

  return query select d.code, d.description, amt, 'Code applied.';
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: place an order. Prices, stock and discounts are computed
-- server-side so the client can never tamper with totals.
-- p_items: [{ "product_id": uuid, "quantity": int }]
-- ---------------------------------------------------------------------
create or replace function public.place_order(
  p_items jsonb,
  p_shipping_address jsonb,
  p_discount_code text default null,
  p_payment_method text default 'cod',
  p_notes text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_email text;
  v_item jsonb;
  v_product public.products;
  v_qty int;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_code text := null;
  v_shipping numeric := 0;
  v_order public.orders;
  v_disc record;
begin
  if v_user is null then
    raise exception 'You must be signed in to place an order.';
  end if;
  if exists (select 1 from public.profiles where id = v_user and is_blocked) then
    raise exception 'This account cannot place orders. Please contact support.';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Your bag is empty.';
  end if;

  select email into v_email from auth.users where id = v_user;

  -- Pass 1: validate + compute subtotal (locks rows)
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(1, (v_item ->> 'quantity')::int);
    select * into v_product from public.products
      where id = (v_item ->> 'product_id')::uuid and is_active
      for update;
    if not found then
      raise exception 'A product in your bag is no longer available.';
    end if;
    if v_product.stock < v_qty then
      raise exception 'Only % left of "%".', v_product.stock, v_product.name;
    end if;
    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  -- Discount
  if p_discount_code is not null and length(trim(p_discount_code)) > 0 then
    select * into v_disc from public.validate_discount(p_discount_code, v_subtotal);
    if v_disc.code is null then
      raise exception '%', v_disc.message;
    end if;
    v_discount := v_disc.discount_amount;
    v_code := v_disc.code;
    update public.discount_codes set used_count = used_count + 1 where code = v_code;
  end if;

  -- Complimentary shipping above ₹5,000, otherwise flat ₹250
  v_shipping := case when (v_subtotal - v_discount) >= 5000 then 0 else 250 end;

  insert into public.orders (
    user_id, email, payment_method, subtotal, discount_code, discount_amount,
    shipping_fee, total, shipping_address, notes
  ) values (
    v_user, v_email, coalesce(p_payment_method, 'cod'), v_subtotal, v_code, v_discount,
    v_shipping, v_subtotal - v_discount + v_shipping, p_shipping_address, p_notes
  ) returning * into v_order;

  -- Pass 2: items + stock
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(1, (v_item ->> 'quantity')::int);
    select * into v_product from public.products where id = (v_item ->> 'product_id')::uuid;
    insert into public.order_items (order_id, product_id, product_name, product_image, unit_price, quantity)
    values (v_order.id, v_product.id, v_product.name, v_product.images[1], v_product.price, v_qty);
    update public.products set stock = stock - v_qty where id = v_product.id;
  end loop;

  return v_order;
end;
$$;

grant execute on function public.validate_discount(text, numeric) to anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb, text, text, text) to authenticated;

-- Customer can cancel their own order while it is still pending
create or replace function public.cancel_my_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_order public.orders;
begin
  select * into v_order from public.orders where id = p_order_id and user_id = auth.uid() for update;
  if not found then raise exception 'Order not found.'; end if;
  if v_order.status not in ('pending', 'confirmed') then
    raise exception 'This order can no longer be cancelled.';
  end if;
  update public.orders set status = 'cancelled' where id = p_order_id;
end;
$$;
grant execute on function public.cancel_my_order(uuid) to authenticated;

-- Restock whenever an order moves into "cancelled" (customer or admin)
create or replace function public.restock_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'A cancelled order cannot be reopened. Ask the customer to place a new order.';
  end if;
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.products p set stock = p.stock + oi.quantity
      from public.order_items oi where oi.order_id = new.id and oi.product_id = p.id;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_restock on public.orders;
create trigger orders_restock before update of status on public.orders
  for each row execute function public.restock_on_cancel();

-- ---------------------------------------------------------------------
-- Storage bucket for product images (public read, admin write)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product-images: public read" on storage.objects;
create policy "product-images: public read" on storage.objects
  for select using (bucket_id = 'product-images');
drop policy if exists "product-images: admin insert" on storage.objects;
create policy "product-images: admin insert" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product-images: admin update" on storage.objects;
create policy "product-images: admin update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product-images: admin delete" on storage.objects;
create policy "product-images: admin delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());
