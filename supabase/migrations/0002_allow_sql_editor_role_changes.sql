-- Fix: role/review guards also blocked the SQL editor (no end-user JWT), so
-- `update profiles set role = 'admin'` was silently reverted. Website users stay restricted.

create or replace function public.is_end_user()
returns boolean
language sql
stable
as $$
  select coalesce(auth.role(), '') in ('anon', 'authenticated');
$$;

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
      new.status := 'pending';
      new.user_id := old.user_id;
    end if;
  end if;
  return new;
end;
$$;

-- Make the Atmosfere marketing account an admin
update public.profiles set role = 'admin' where email = 'marketing@atmosfere.in';

select email, role from public.profiles where email = 'marketing@atmosfere.in';
