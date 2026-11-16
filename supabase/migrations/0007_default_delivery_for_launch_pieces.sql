-- Launch pieces use the store's default delivery time ("Dispatched in 5–7 working days.").
update public.products set delivery_time = null
where slug in ('cane-armchair', 'cane-chaise-lounge', 'cane-side-table');
