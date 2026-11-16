-- Shop by Vibe: styled corners whose pieces can be bought together or one by one.
-- Safe to run again.

-- 1. Corners and the products placed in them -----------------------------------------
create table if not exists public.vibe_corners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text,
  story text,
  image text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- x / y: where the dot sits on the corner image, in % from the top-left.
-- default_options: the variations shown in the image, e.g. {"Polish":"Natural"}.
create table if not exists public.vibe_corner_items (
  id uuid primary key default gen_random_uuid(),
  corner_id uuid not null references public.vibe_corners (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  x numeric(5, 2) not null check (x between 0 and 100),
  y numeric(5, 2) not null check (y between 0 and 100),
  default_options jsonb not null default '{}'::jsonb,
  sort_order int not null default 0
);
create index if not exists vibe_corner_items_corner_idx on public.vibe_corner_items (corner_id);
create index if not exists vibe_corner_items_product_idx on public.vibe_corner_items (product_id);

alter table public.vibe_corners enable row level security;
alter table public.vibe_corner_items enable row level security;

drop policy if exists "vibe_corners: public read active" on public.vibe_corners;
create policy "vibe_corners: public read active" on public.vibe_corners
  for select using (is_active or public.is_admin());
drop policy if exists "vibe_corners: admin write" on public.vibe_corners;
create policy "vibe_corners: admin write" on public.vibe_corners
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "vibe_corner_items: public read" on public.vibe_corner_items;
create policy "vibe_corner_items: public read" on public.vibe_corner_items
  for select using (exists (select 1 from public.vibe_corners c where c.id = corner_id and (c.is_active or public.is_admin())));
drop policy if exists "vibe_corner_items: admin write" on public.vibe_corner_items;
create policy "vibe_corner_items: admin write" on public.vibe_corner_items
  for all using (public.is_admin()) with check (public.is_admin());

-- 2. Colour swatches for the launch pieces' variations -----------------------------------
-- A choice can carry "swatch" (a colour) and/or "image" (a texture photo); both are optional.
with wood as (select '{"name":"Wood","values":[{"label":"Teak","price":0,"swatch":"#A8733F"},{"label":"Mango","price":0,"swatch":"#C9A46C"},{"label":"Acacia","price":0,"swatch":"#7E5232"}]}'::jsonb as o),
polish as (select '{"name":"Polish","values":[{"label":"Natural","price":0,"swatch":"#D2A673"},{"label":"Walnut","price":0,"swatch":"#5E3B24"},{"label":"Black","price":0,"swatch":"#22201D"}]}'::jsonb as o),
sheen as (select '{"name":"Finish","values":[{"label":"Matte","price":0},{"label":"Gloss","price":0}]}'::jsonb as o),
fabric as (select '{"name":"Fabric","values":[{"label":"Suede","price":0,"swatch":"#B49A7E"},{"label":"Jacquard","price":0,"swatch":"#7D8FA3"}]}'::jsonb as o)
update public.products p set options = case p.slug
  when 'cane-armchair' then jsonb_build_array((select o from wood), (select o from polish), (select o from sheen), (select o from fabric))
  else jsonb_build_array((select o from wood), (select o from polish), (select o from sheen))
end
where p.slug in ('cane-armchair', 'cane-chaise-lounge', 'cane-side-table');

-- 3. Demo corners: the chaise lounge styled four ways --------------------------------
insert into public.vibe_corners (name, slug, tagline, story, image, sort_order) values
  ('Bohemian', 'bohemian', 'Earthy, layered and sun-warmed.',
   'Terracotta walls, a woven pendant glow and textiles collected over years. The cane chaise sits at the heart of it — a slow corner for long afternoons.',
   '/vibes/bohemian.jpg', 1),
  ('Modern Minimal', 'modern-minimal', 'Quiet lines, warm light, nothing extra.',
   'A calm palette of bone and black lets the sculpted wood of the chaise do the talking. One lamp, one print, room to breathe.',
   '/vibes/modern-minimal.jpg', 2),
  ('Maximalist', 'maximalist', 'Rich colour, bold pattern, more is more.',
   'Deep green walls, gallery-hung art and jewel-toned textiles. The chaise grounds the drama with honest wood and cane.',
   '/vibes/maximalist.jpg', 3),
  ('Coastal', 'coastal', 'Breezy blues and sand-washed texture.',
   'Sea light, striped linen and natural fibres. The chaise becomes a lounger by the window, made for slow mornings.',
   '/vibes/coastal.jpg', 4)
on conflict (slug) do update set
  name = excluded.name, tagline = excluded.tagline, story = excluded.story, image = excluded.image, sort_order = excluded.sort_order;

-- Dots: the chaise is the real launch piece; the rest are demo products until the real ones are added.
delete from public.vibe_corner_items where corner_id in (select id from public.vibe_corners where slug in ('bohemian', 'modern-minimal', 'maximalist', 'coastal'));
insert into public.vibe_corner_items (corner_id, product_id, x, y, default_options, sort_order)
select c.id, p.id, v.x, v.y, v.opts::jsonb, v.ord
from (values
  ('bohemian', 'cane-chaise-lounge', 48, 79, '{"Wood":"Teak","Polish":"Natural","Finish":"Matte"}', 1),
  ('bohemian', 'atelier-task-lamp', 29, 21, '{}', 2),
  ('bohemian', 'curated-gallery-wall', 55, 27, '{}', 3),
  ('bohemian', 'marigold-linen-cushion', 46, 66, '{}', 4),
  ('bohemian', 'ember-hand-poured-candle', 20, 67, '{}', 5),
  ('bohemian', 'handwoven-jute-rug', 34, 94, '{}', 6),

  ('modern-minimal', 'cane-chaise-lounge', 42, 79, '{"Wood":"Teak","Polish":"Natural","Finish":"Matte"}', 1),
  ('modern-minimal', 'atelier-task-lamp', 15, 28, '{}', 2),
  ('modern-minimal', 'console-frame-set', 31, 29, '{}', 3),
  ('modern-minimal', 'marigold-linen-cushion', 40, 67, '{}', 4),
  ('modern-minimal', 'ember-hand-poured-candle', 15, 67, '{}', 5),
  ('modern-minimal', 'handwoven-jute-rug', 24, 94, '{}', 6),

  ('maximalist', 'cane-chaise-lounge', 43, 79, '{"Wood":"Teak","Polish":"Natural","Finish":"Gloss"}', 1),
  ('maximalist', 'atelier-task-lamp', 16, 19, '{}', 2),
  ('maximalist', 'curated-gallery-wall', 45, 21, '{}', 3),
  ('maximalist', 'marigold-linen-cushion', 47, 58, '{}', 4),
  ('maximalist', 'ember-hand-poured-candle', 15, 60, '{}', 5),
  ('maximalist', 'handwoven-jute-rug', 24, 94, '{}', 6),

  ('coastal', 'cane-chaise-lounge', 42, 79, '{"Wood":"Teak","Polish":"Natural","Finish":"Matte"}', 1),
  ('coastal', 'atelier-task-lamp', 19, 27, '{}', 2),
  ('coastal', 'console-frame-set', 47, 26, '{}', 3),
  ('coastal', 'marigold-linen-cushion', 45, 64, '{}', 4),
  ('coastal', 'handwoven-jute-rug', 20, 89, '{}', 5)
) as v (corner_slug, product_slug, x, y, opts, ord)
join public.vibe_corners c on c.slug = v.corner_slug
join public.products p on p.slug = v.product_slug;
