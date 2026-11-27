-- More photos per product: extra views, styled rooms and the dimension drawings.
update public.products set images = array[
  '/products/chaise-lounge-1.jpg', '/products/chaise-lounge-2.jpg', '/vibes/modern-minimal.jpg', '/vibes/bohemian.jpg', '/products/chaise-lounge-drawing.jpg'
] where slug = 'cane-chaise-lounge';

update public.products set images = array[
  '/products/cane-armchair-1.jpg', '/products/cane-armchair-2.jpg', '/products/cane-armchair-drawing.jpg'
] where slug = 'cane-armchair';

update public.products set images = array[
  '/products/side-table-1.jpg', '/products/cane-side-table-drawing.jpg'
] where slug = 'cane-side-table';
