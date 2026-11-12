-- =====================================================================
-- Atmosfere Living — sample catalogue. Safe to re-run.
-- =====================================================================
insert into public.categories (name, slug, description, image_url, sort_order) values
  ('Furniture', 'furniture', 'Sculpted seating, tables and storage made to last.', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', 1),
  ('Lighting', 'lighting', 'Pendants, lamps and sconces that set the mood.', 'https://images.unsplash.com/photo-1615529182904-14819c35db37', 2),
  ('Decor', 'decor', 'Vessels, candles and objects for the considered shelf.', 'https://images.unsplash.com/photo-1532372320572-cda25653a26d', 3),
  ('Textiles', 'textiles', 'Cushions, throws and rugs in natural fibres.', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af', 4),
  ('Wall Art', 'wall-art', 'Frames, prints and gallery sets for every wall.', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38', 5)
on conflict (slug) do update set description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order;

with c as (select id, slug from public.categories)
insert into public.products (name, slug, short_description, description, category_id, price, compare_at_price, stock, sku, images, materials, dimensions, care, is_featured) values
  ('Verdant Velvet Sofa', 'verdant-velvet-sofa', 'A deep three-seater in emerald cotton velvet.',
   'Generous proportions, a tight back and softly tapered oak legs. The Verdant sofa is built on a kiln-dried hardwood frame with high-resilience foam wrapped in feather down for a seat that holds its shape for years.',
   (select id from c where slug='furniture'), 84900, 96000, 6, 'AL-FUR-001',
   array['https://images.unsplash.com/photo-1555041469-a586c61ea9bc','https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e'],
   'Cotton velvet, solid oak, hardwood frame', 'W 214 × D 92 × H 78 cm', 'Vacuum gently. Spot clean with a damp cloth.', true),
  ('Saffron Lounge Chair', 'saffron-lounge-chair', 'A sculpted armchair in mustard bouclé.',
   'Low, wide and quietly glamorous. Upholstered in a textured bouclé with a sweeping curved back that cradles you.',
   (select id from c where slug='furniture'), 32500, null, 10, 'AL-FUR-002',
   array['https://images.unsplash.com/photo-1616627547584-bf28cee262db','https://images.unsplash.com/photo-1586023492125-27b2c045efd7'],
   'Bouclé, beech wood', 'W 78 × D 80 × H 74 cm', 'Brush lightly; avoid direct sunlight.', true),
  ('Ivory Tufted Armchair', 'ivory-tufted-armchair', 'Button-tufted wingback in ivory linen blend.',
   'A modern take on the wingback — crisp ivory upholstery, hand-tufted buttons and slender turned legs.',
   (select id from c where slug='furniture'), 27900, 31500, 8, 'AL-FUR-003',
   array['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c'],
   'Linen blend, mango wood', 'W 72 × D 76 × H 98 cm', 'Professional clean recommended.', false),
  ('Terracotta Modular Sofa', 'terracotta-modular-sofa', 'Low-slung modular sofa in burnt-orange weave.',
   'Arrange it as a three-seater or split it into a pair of lounge seats. Woven upholstery in a warm terracotta that ages beautifully.',
   (select id from c where slug='furniture'), 112000, null, 3, 'AL-FUR-004',
   array['https://images.unsplash.com/photo-1567016432779-094069958ea5'],
   'Woven polyester-linen, pine frame', 'W 240 × D 98 × H 70 cm', 'Removable covers, dry clean.', true),
  ('Ash Counter Stool', 'ash-counter-stool', 'A pared-back stool in whitewashed ash.',
   'Joinery-led and refreshingly simple: four splayed legs, a footrest rail and a softly dished seat.',
   (select id from c where slug='furniture'), 8900, null, 24, 'AL-FUR-005',
   array['https://images.unsplash.com/photo-1503602642458-232111445657'],
   'Solid ash', 'Ø 34 × H 65 cm', 'Wipe with a dry cloth.', false),
  ('Shell Dining Chair', 'shell-dining-chair', 'Moulded shell seat on a wire-and-oak base.',
   'A mid-century silhouette for the dining table or the desk, with a moulded seat that is easy to live with.',
   (select id from c where slug='furniture'), 7400, 8200, 30, 'AL-FUR-006',
   array['https://images.unsplash.com/photo-1581539250439-c96689b516dd','https://images.unsplash.com/photo-1592078615290-033ee584e267'],
   'Polypropylene, steel, beech', 'W 46 × D 54 × H 81 cm', 'Wipe clean.', false),
  ('Linen Bench with Cushions', 'linen-bench-with-cushions', 'Leather-strap bench dressed in linen cushions.',
   'An entryway or bed-end bench with a woven leather seat — styled with three of our linen cushions.',
   (select id from c where slug='furniture'), 21500, null, 7, 'AL-FUR-007',
   array['https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b'],
   'Teak, vegetable-tanned leather, linen', 'W 120 × D 40 × H 45 cm', 'Condition leather twice a year.', false),

  ('Lagoon Pendant', 'lagoon-pendant', 'A spun-metal dome pendant in matte white.',
   'Clean lines and a warm downlight. The Lagoon pendant is spun from a single sheet of aluminium and finished in a soft matte enamel.',
   (select id from c where slug='lighting'), 6900, null, 20, 'AL-LGT-001',
   array['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15'],
   'Spun aluminium, fabric cord', 'Ø 30 × H 22 cm, 150 cm drop', 'Dust with a soft cloth. E27 bulb.', true),
  ('Copper Dome Pendant Trio', 'copper-dome-pendant-trio', 'Three polished-copper domes on a shared canopy.',
   'A statement over the dining table — three hand-polished copper domes hung at staggered heights.',
   (select id from c where slug='lighting'), 18500, 21000, 9, 'AL-LGT-002',
   array['https://images.unsplash.com/photo-1540932239986-30128078f3c5','https://images.unsplash.com/photo-1615529182904-14819c35db37'],
   'Copper, steel', 'Each Ø 25 cm, canopy 90 cm', 'Polish with a dry cloth.', true),
  ('Atelier Task Lamp', 'atelier-task-lamp', 'An articulated desk lamp in graphite.',
   'Adjustable at every joint, weighted at the base and finished in a graphite powder-coat.',
   (select id from c where slug='lighting'), 5400, null, 18, 'AL-LGT-003',
   array['https://images.unsplash.com/photo-1507473885765-e6ed057f782c'],
   'Powder-coated steel', 'H 52 cm (adjustable)', 'Wipe clean. E14 bulb.', false),

  ('Alba Stoneware Vase', 'alba-stoneware-vase', 'A wide-shouldered vase in chalk-white glaze.',
   'Hand-thrown in Khurja and finished in a satin chalk glaze. Beautiful empty, better with dried stems.',
   (select id from c where slug='decor'), 3200, null, 40, 'AL-DEC-001',
   array['https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c'],
   'Stoneware', 'Ø 18 × H 26 cm', 'Hand wash only.', true),
  ('Mist Vessel Set', 'mist-vessel-set', 'Two tall vessels in a soft graphite glaze.',
   'A pair of slender bottle vases in complementary heights, designed to be styled together.',
   (select id from c where slug='decor'), 4600, 5200, 25, 'AL-DEC-002',
   array['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261'],
   'Ceramic', 'H 32 cm & H 24 cm', 'Hand wash only.', false),
  ('Sand & Stone Planter Duo', 'sand-stone-planter-duo', 'Two ceramic planters with a raw clay base.',
   'Half-dipped glaze over raw terracotta, with drainage holes and matching saucers.',
   (select id from c where slug='decor'), 2800, null, 32, 'AL-DEC-003',
   array['https://images.unsplash.com/photo-1610701596007-11502861dcfa'],
   'Terracotta, glaze', 'Ø 16 cm & Ø 12 cm', 'Wipe clean.', false),
  ('Ember Hand-poured Candle', 'ember-hand-poured-candle', 'Soy wax candle with notes of oud and amber.',
   'Hand-poured in small batches into a smoked-glass vessel. Approx. 50 hours of burn time.',
   (select id from c where slug='decor'), 1450, null, 80, 'AL-DEC-004',
   array['https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6'],
   'Soy wax, cotton wick, glass', '300 g', 'Trim wick to 5 mm before each burn.', true),
  ('Floating Oak Shelf', 'floating-oak-shelf', 'A slim wall shelf with concealed brackets.',
   'One solid oak plank, no visible fixings. Made to hold books, plants and the things you love.',
   (select id from c where slug='decor'), 3900, null, 22, 'AL-DEC-005',
   array['https://images.unsplash.com/photo-1594026112284-02bb6f3352fe'],
   'Solid oak', 'W 80 × D 20 × H 3 cm', 'Oil once a year.', false),

  ('Marigold Linen Cushion', 'marigold-linen-cushion', 'Stonewashed linen cushion with feather insert.',
   'Pure European linen, stonewashed for softness, with a hidden zip and a duck-feather inner.',
   (select id from c where slug='textiles'), 1900, null, 60, 'AL-TEX-001',
   array['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2'],
   'Linen, duck feather', '50 × 50 cm', 'Cover machine washable at 30°.', false),
  ('Handwoven Jute Rug', 'handwoven-jute-rug', 'Flat-woven jute rug with a bound edge.',
   'Woven by hand in Bhadohi from natural jute — durable, grounding and quietly textural.',
   (select id from c where slug='textiles'), 12500, 14900, 12, 'AL-TEX-002',
   array['https://images.unsplash.com/photo-1600166898405-da9535204843'],
   'Natural jute, cotton binding', '170 × 240 cm', 'Vacuum regularly; spot clean.', true),

  ('Console Frame Set', 'console-frame-set', 'Three oak frames to lean or hang.',
   'A curated set of three solid-oak frames with museum-grade mounts — styled on a console or hung as a trio.',
   (select id from c where slug='wall-art'), 5600, null, 15, 'AL-ART-001',
   array['https://images.unsplash.com/photo-1618220048045-10a6dbdf83e0'],
   'Oak, glass, acid-free mount', 'A3, A4, A5', 'Dust with a soft cloth.', false),
  ('Curated Gallery Wall', 'curated-gallery-wall', 'A nine-piece gallery wall, ready to hang.',
   'Prints, frames and a paper hanging template — everything you need for a balanced gallery wall in an afternoon.',
   (select id from c where slug='wall-art'), 14800, 16500, 6, 'AL-ART-002',
   array['https://images.unsplash.com/photo-1513519245088-0e12902e5a38'],
   'Archival prints, black ash frames', 'Approx. 180 × 120 cm arrangement', 'Keep out of direct sunlight.', true)
on conflict (slug) do nothing;

insert into public.discount_codes (code, description, type, value, min_order_amount, max_discount_amount, usage_limit) values
  ('WELCOME10', '10% off your first order', 'percent', 10, 2000, 5000, null),
  ('LIVING1500', '₹1,500 off orders above ₹15,000', 'fixed', 1500, 15000, null, 500)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- Make yourself an admin (run after first signing in with Google):
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------
