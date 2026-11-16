-- 1. Per-product variations (e.g. Polish, Fabric, Wood, Shade).
-- products.options:     [{"name":"Polish","values":[{"label":"Natural","price":0},{"label":"Walnut","price":1500}]}]
-- order_items.options:  {"Polish":"Walnut","Fabric":"Jacquard"}  (what the customer chose)
-- A value's "price" is added to the product's base price (0 = same price).

alter table public.products add column if not exists options jsonb not null default '[]'::jsonb;
alter table public.order_items add column if not exists options jsonb not null default '{}'::jsonb;

-- 2. "Coming soon": shown in the store with no price and no Add to bag, until the price is set.
alter table public.products add column if not exists is_coming_soon boolean not null default false;

-- 3. Demo/sample products are marked so real products always list first, and demo ones can be hidden in one go.
alter table public.products add column if not exists is_demo boolean not null default false;
update public.products set is_demo = true where images[1] like 'https://images.unsplash.com/%';

-- Unit price for a product with the chosen options. Raises if a choice is missing or invalid.
create or replace function public.priced_with_options(p_product public.products, p_chosen jsonb)
returns numeric
language plpgsql
stable
set search_path = public
as $$
declare
  v_opt jsonb;
  v_pick text;
  v_val jsonb;
  v_price numeric := p_product.price;
  v_found boolean;
begin
  for v_opt in select * from jsonb_array_elements(coalesce(p_product.options, '[]'::jsonb)) loop
    if jsonb_array_length(coalesce(v_opt -> 'values', '[]'::jsonb)) = 0 then
      continue;
    end if;
    v_pick := coalesce(p_chosen, '{}'::jsonb) ->> (v_opt ->> 'name');
    if v_pick is null then
      raise exception 'Please choose a % for "%".', lower(v_opt ->> 'name'), p_product.name;
    end if;
    v_found := false;
    for v_val in select * from jsonb_array_elements(v_opt -> 'values') loop
      if v_val ->> 'label' = v_pick then
        v_price := v_price + coalesce((v_val ->> 'price')::numeric, 0);
        v_found := true;
      end if;
    end loop;
    if not v_found then
      raise exception '"%" is no longer offered for "%". Please update your bag.', v_pick, p_product.name;
    end if;
  end loop;
  return v_price;
end;
$$;

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
  v_unit numeric;
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

  -- Pass 1: validate + compute subtotal (locks rows). Stock is checked per product across all lines.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(1, (v_item ->> 'quantity')::int);
    select * into v_product from public.products
      where id = (v_item ->> 'product_id')::uuid and is_active
      for update;
    if not found then
      raise exception 'A product in your bag is no longer available.';
    end if;
    if v_product.is_coming_soon then
      raise exception '"%" is coming soon and cannot be ordered yet.', v_product.name;
    end if;
    if v_product.stock < (
      select coalesce(sum(greatest(1, (x ->> 'quantity')::int)), 0)
      from jsonb_array_elements(p_items) x
      where (x ->> 'product_id')::uuid = v_product.id
    ) then
      raise exception 'Only % left of "%".', v_product.stock, v_product.name;
    end if;
    v_subtotal := v_subtotal + public.priced_with_options(v_product, v_item -> 'options') * v_qty;
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
    v_unit := public.priced_with_options(v_product, v_item -> 'options');
    insert into public.order_items (order_id, product_id, product_name, product_image, unit_price, quantity, options)
    values (
      v_order.id, v_product.id, v_product.name, v_product.images[1], v_unit, v_qty,
      case when jsonb_typeof(v_item -> 'options') = 'object' then v_item -> 'options' else '{}'::jsonb end
    );
    update public.products set stock = stock - v_qty where id = v_product.id;
  end loop;

  return v_order;
end;
$$;
