-- Atmosfere Living launch pieces (from the furniture detail drawings, AT/FD).
-- Listed as "Coming soon" until prices are set in Admin → Products.
-- Safe to run again: existing rows (matched by slug) are updated, not duplicated.

with furniture as (select id from public.categories where slug = 'furniture'),
wood   as (select '{"name":"Wood","values":[{"label":"Teak","price":0},{"label":"Mango","price":0},{"label":"Acacia","price":0}]}'::jsonb as o),
polish as (select '{"name":"Polish","values":[{"label":"Natural","price":0},{"label":"Walnut","price":0},{"label":"Black","price":0}]}'::jsonb as o),
sheen  as (select '{"name":"Finish","values":[{"label":"Matte","price":0},{"label":"Gloss","price":0}]}'::jsonb as o),
fabric as (select '{"name":"Fabric","values":[{"label":"Suede","price":0},{"label":"Jacquard","price":0}]}'::jsonb as o)
insert into public.products (
  name, slug, sku, short_description, description, category_id, price, stock, images,
  materials, dimensions, care, options, is_active, is_featured, is_coming_soon, is_demo
)
select * from (values
  (
    'Cane Armchair', 'cane-armchair', 'AT-FD-AC-02',
    'A rounded solid-wood armchair with hand-woven cane panels and an upholstered seat.',
    'A compact lounge armchair with a curved solid-wood frame that wraps around the seat. Hand-woven cane panels sit inside the arms and back, and a deep upholstered cushion makes it an easy chair for reading corners, bedrooms and living rooms. Made to order in your choice of wood, polish and fabric.',
    (select id from furniture), 0::numeric, 0, array['/products/cane-armchair-1.jpg'],
    'Solid wood frame; hand-woven cane; upholstered seat',
    'W 66 × D 60 × H 64 cm',
    'Dust with a soft dry cloth. Keep away from direct sunlight and moisture. Vacuum the fabric gently.',
    jsonb_build_array((select o from wood), (select o from polish), (select o from sheen), (select o from fabric)),
    true, true, true, false
  ),
  (
    'Cane Chaise Lounge', 'cane-chaise-lounge', 'AT-FD-CL-01',
    'A sculpted solid-wood chaise lounge with a hand-woven cane seat.',
    'A full-length lounger shaped from solid wood, with flowing side panels that follow the body from headrest to footrest. The seat is hand-woven cane, which stays cool and breathes. A statement piece for a living room, verandah or bedroom corner. Made to order in your choice of wood, polish and finish.',
    (select id from furniture), 0::numeric, 0, array['/products/chaise-lounge-1.jpg'],
    'Solid wood; hand-woven cane',
    'L 183 × W 75 × H 76 cm',
    'Dust with a soft dry cloth. Keep away from direct sunlight and moisture. Avoid sharp objects on the cane.',
    jsonb_build_array((select o from wood), (select o from polish), (select o from sheen)),
    true, true, true, false
  ),
  (
    'Cane Side Table', 'cane-side-table', 'AT-FD-ST-03',
    'A C-shaped solid-wood side table with a cane panel and a magazine shelf.',
    'A side table with a cantilevered C-shaped frame, so the top slides over the arm or seat of a sofa. A hand-woven cane panel and a low shelf hold books, magazines or a tablet. Made to order in your choice of wood, polish and finish.',
    (select id from furniture), 0::numeric, 0, array[]::text[],
    'Solid wood; hand-woven cane',
    'W 45 × D 68 × H 56 cm (top 55 × 45 cm)',
    'Dust with a soft dry cloth. Use coasters for hot or wet items. Keep away from direct sunlight.',
    jsonb_build_array((select o from wood), (select o from polish), (select o from sheen)),
    true, true, true, false
  )
) as v (
  name, slug, sku, short_description, description, category_id, price, stock, images,
  materials, dimensions, care, options, is_active, is_featured, is_coming_soon, is_demo
)
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  short_description = excluded.short_description,
  description = excluded.description,
  category_id = excluded.category_id,
  images = excluded.images,
  materials = excluded.materials,
  dimensions = excluded.dimensions,
  care = excluded.care,
  options = excluded.options,
  is_featured = excluded.is_featured;
