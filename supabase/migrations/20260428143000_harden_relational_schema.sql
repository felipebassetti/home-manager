create schema if not exists extensions;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.sync_application_timestamps()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();

  if tg_op = 'INSERT' then
    new.status_updated_at = coalesce(new.status_updated_at, new.created_at, now());
    return new;
  end if;

  if new.status is distinct from old.status then
    new.status_updated_at = now();
  else
    new.status_updated_at = coalesce(new.status_updated_at, old.status_updated_at, now());
  end if;

  return new;
end;
$$;

create or replace function public.validate_application_room_house()
returns trigger
language plpgsql
as $$
begin
  if new.room_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.rooms room
    where room.id = new.room_id
      and room.house_id = new.house_id
  ) then
    raise exception 'room_id must belong to the same house as house_id';
  end if;

  return new;
end;
$$;

update public.profiles
set
  name = btrim(name),
  email = lower(btrim(email))
where name <> btrim(name)
   or email <> lower(btrim(email));

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

alter table public.profiles
  drop constraint if exists profiles_name_not_blank_check;

alter table public.profiles
  add constraint profiles_name_not_blank_check
  check (char_length(btrim(name)) > 0);

alter table public.profiles
  drop constraint if exists profiles_email_not_blank_check;

alter table public.profiles
  add constraint profiles_email_not_blank_check
  check (char_length(btrim(email)) > 0);

alter table public.profiles
  drop constraint if exists profiles_email_lowercase_check;

alter table public.profiles
  add constraint profiles_email_lowercase_check
  check (email = lower(email));

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  constraint user_roles_role_check check (role in ('site_admin', 'site_operator')),
  constraint user_roles_pkey primary key (user_id, role)
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'account_type'
  ) then
    execute $sql$
      insert into public.user_roles (user_id, role)
      select id, 'site_admin'
      from public.profiles
      where account_type = 'super-admin'
      on conflict (user_id, role) do nothing
    $sql$;
  end if;
end
$$;

alter table public.profiles
  drop constraint if exists profiles_account_type_check;

alter table public.profiles
  drop column if exists account_type;

alter table public.houses
  add column if not exists updated_at timestamptz not null default now();

alter table public.houses
  drop constraint if exists houses_title_not_blank_check;

alter table public.houses
  add constraint houses_title_not_blank_check
  check (char_length(btrim(title)) > 0);

alter table public.houses
  drop constraint if exists houses_description_not_blank_check;

alter table public.houses
  add constraint houses_description_not_blank_check
  check (char_length(btrim(description)) > 0);

alter table public.houses
  drop constraint if exists houses_city_not_blank_check;

alter table public.houses
  add constraint houses_city_not_blank_check
  check (char_length(btrim(city)) > 0);

alter table public.houses
  drop constraint if exists houses_neighborhood_not_blank_check;

alter table public.houses
  add constraint houses_neighborhood_not_blank_check
  check (char_length(btrim(neighborhood)) > 0);

alter table public.houses
  drop constraint if exists houses_address_not_blank_check;

alter table public.houses
  add constraint houses_address_not_blank_check
  check (char_length(btrim(address)) > 0);

alter table public.houses
  drop constraint if exists houses_image_url_not_blank_check;

alter table public.houses
  add constraint houses_image_url_not_blank_check
  check (image_url is null or char_length(btrim(image_url)) > 0);

alter table public.houses
  drop constraint if exists houses_amenities_no_blank_items_check;

alter table public.houses
  add constraint houses_amenities_no_blank_items_check
  check (array_position(amenities, '') is null);

alter table public.rooms
  add column if not exists created_at timestamptz not null default now();

alter table public.rooms
  add column if not exists updated_at timestamptz not null default now();

alter table public.rooms
  drop constraint if exists rooms_title_not_blank_check;

alter table public.rooms
  add constraint rooms_title_not_blank_check
  check (char_length(btrim(title)) > 0);

alter table public.rooms
  drop constraint if exists rooms_price_positive_check;

alter table public.rooms
  add constraint rooms_price_positive_check
  check (price > 0);

alter table public.house_members
  add column if not exists updated_at timestamptz not null default now();

alter table public.house_members
  drop constraint if exists house_members_role_check;

alter table public.house_members
  add constraint house_members_role_check
  check (role in ('admin', 'member'));

alter table public.house_members
  drop constraint if exists house_members_status_check;

alter table public.house_members
  add constraint house_members_status_check
  check (status in ('active', 'invited'));

alter table public.house_members
  drop constraint if exists house_members_user_id_fkey;

alter table public.house_members
  add constraint house_members_user_id_fkey
  foreign key (user_id)
  references public.profiles (id)
  on delete cascade;

insert into public.house_members (house_id, user_id, role, status, created_at, updated_at)
select house.id, house.owner_id, 'admin', 'active', coalesce(house.created_at, now()), now()
from public.houses house
left join public.house_members member
  on member.house_id = house.id
 and member.user_id = house.owner_id
where member.id is null
on conflict (house_id, user_id) do nothing;

alter table public.applications
  add column if not exists updated_at timestamptz not null default now();

update public.applications
set
  message = btrim(message),
  contact_phone = btrim(contact_phone),
  contact_instagram = nullif(btrim(contact_instagram), '')
where message <> btrim(message)
   or contact_phone <> btrim(contact_phone)
   or contact_instagram is distinct from nullif(btrim(contact_instagram), '');

alter table public.applications
  drop constraint if exists applications_message_length_check;

alter table public.applications
  add constraint applications_message_length_check
  check (char_length(btrim(message)) >= 12);

alter table public.applications
  drop constraint if exists applications_contact_phone_not_blank_check;

alter table public.applications
  add constraint applications_contact_phone_not_blank_check
  check (char_length(btrim(contact_phone)) > 0);

alter table public.applications
  drop constraint if exists applications_contact_instagram_not_blank_check;

alter table public.applications
  add constraint applications_contact_instagram_not_blank_check
  check (contact_instagram is null or char_length(btrim(contact_instagram)) > 0);

alter table public.applications
  drop constraint if exists applications_status_updated_after_created_check;

alter table public.applications
  add constraint applications_status_updated_after_created_check
  check (status_updated_at >= created_at);

alter table public.applications
  drop constraint if exists applications_status_check;

alter table public.applications
  add constraint applications_status_check
  check (status in ('submitted', 'in_review', 'contact_soon', 'rejected'));

alter table public.applications
  drop constraint if exists applications_user_id_fkey;

alter table public.applications
  add constraint applications_user_id_fkey
  foreign key (user_id)
  references public.profiles (id)
  on delete cascade;

alter table public.monthly_charges
  add column if not exists updated_at timestamptz not null default now();

alter table public.monthly_charges
  drop constraint if exists monthly_charges_title_not_blank_check;

alter table public.monthly_charges
  add constraint monthly_charges_title_not_blank_check
  check (char_length(btrim(title)) > 0);

alter table public.monthly_charges
  drop constraint if exists monthly_charges_amount_positive_check;

alter table public.monthly_charges
  add constraint monthly_charges_amount_positive_check
  check (amount > 0);

alter table public.payments
  add column if not exists updated_at timestamptz not null default now();

update public.payments
set paid_at = null
where status in ('pending', 'overdue');

alter table public.payments
  drop constraint if exists payments_amount_positive_check;

alter table public.payments
  add constraint payments_amount_positive_check
  check (amount > 0);

alter table public.payments
  drop constraint if exists payments_status_check;

alter table public.payments
  add constraint payments_status_check
  check (status in ('pending', 'paid', 'overdue'));

alter table public.payments
  drop constraint if exists payments_paid_at_consistency_check;

alter table public.payments
  add constraint payments_paid_at_consistency_check
  check (
    (status = 'paid' and paid_at is not null) or
    (status in ('pending', 'overdue') and paid_at is null)
  );

create index if not exists idx_houses_owner_id on public.houses (owner_id);
create index if not exists idx_houses_created_at on public.houses (created_at desc);
create index if not exists idx_houses_city_trgm on public.houses using gin (city gin_trgm_ops);
create index if not exists idx_houses_neighborhood_trgm on public.houses using gin (neighborhood gin_trgm_ops);

create index if not exists idx_user_roles_role on public.user_roles (role);

create index if not exists idx_rooms_house_id on public.rooms (house_id);
create index if not exists idx_rooms_house_available_price on public.rooms (house_id, available, price);

create index if not exists idx_house_members_user_id on public.house_members (user_id);
create index if not exists idx_house_members_house_role on public.house_members (house_id, role);

create index if not exists idx_applications_user_created_at on public.applications (user_id, created_at desc);
create index if not exists idx_applications_house_status_created_at on public.applications (house_id, status, created_at desc);
create index if not exists idx_applications_room_id on public.applications (room_id);

create index if not exists idx_monthly_charges_house_due_date on public.monthly_charges (house_id, due_date);

create index if not exists idx_payments_charge_id on public.payments (charge_id);
create index if not exists idx_payments_user_created_at on public.payments (user_id, created_at desc);
create index if not exists idx_payments_status_created_at on public.payments (status, created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists set_houses_updated_at on public.houses;
create trigger set_houses_updated_at
before update on public.houses
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at
before update on public.rooms
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists set_house_members_updated_at on public.house_members;
create trigger set_house_members_updated_at
before update on public.house_members
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists set_applications_timestamps on public.applications;
create trigger set_applications_timestamps
before insert or update on public.applications
for each row
execute function public.sync_application_timestamps();

drop trigger if exists validate_application_room_house on public.applications;
create trigger validate_application_room_house
before insert or update of house_id, room_id on public.applications
for each row
execute function public.validate_application_room_house();

drop trigger if exists set_monthly_charges_updated_at on public.monthly_charges;
create trigger set_monthly_charges_updated_at
before update on public.monthly_charges
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row
execute function public.set_updated_at_timestamp();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.houses enable row level security;
alter table public.rooms enable row level security;
alter table public.house_members enable row level security;
alter table public.applications enable row level security;
alter table public.monthly_charges enable row level security;
alter table public.payments enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "house_members_select_own" on public.house_members;
create policy "house_members_select_own"
  on public.house_members
  for select
  to authenticated
  using (auth.uid() = user_id);
