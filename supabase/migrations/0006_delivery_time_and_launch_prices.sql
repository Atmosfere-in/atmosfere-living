-- 1. Per-product delivery time, shown on the product page (blank = the store default).
alter table public.products add column if not exists delivery_time text;

-- 2. Launch pieces go on sale. Prices and stock are provisional and can be changed in Admin → Products.
update public.products set
  is_coming_soon = false,
  stock = 10,
  delivery_time = 'Made to order. Dispatched in 3–4 weeks.',
  price = case slug
    when 'cane-armchair' then 4800
    when 'cane-chaise-lounge' then 4900
    when 'cane-side-table' then 4200
  end
where slug in ('cane-armchair', 'cane-chaise-lounge', 'cane-side-table');
