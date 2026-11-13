-- Fix 0002: auth.role() was set inside the Supabase SQL editor too, so the editor still
-- counted as a website user. Website (Data API) requests always connect as `authenticator`.

create or replace function public.is_end_user()
returns boolean
language sql
stable
as $$
  select session_user = 'authenticator' and coalesce(auth.role(), 'anon') <> 'service_role';
$$;

-- Make the Atmosfere marketing account an admin
update public.profiles set role = 'admin' where email = 'marketing@atmosfere.in';

-- Check: role should now be 'admin'. The last two columns help diagnose if it isn't.
select email, role, session_user as connected_as, public.is_end_user() as treated_as_website_user
from public.profiles
where email = 'marketing@atmosfere.in';
