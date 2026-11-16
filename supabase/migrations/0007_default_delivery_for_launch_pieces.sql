-- Launch pieces use the store default delivery time.
update public.products set delivery_time = null
where slug in ('cane-armchair', 'cane-chaise-lounge', 'cane-side-table');
