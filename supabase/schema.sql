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

create table if not exists public.profiles (
  id uuid primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_name_not_blank_check check (char_length(btrim(name)) > 0),
  constraint profiles_email_not_blank_check check (char_length(btrim(email)) > 0),
  constraint profiles_email_lowercase_check check (email = lower(email))
);

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  constraint user_roles_role_check check (role in ('site_admin', 'site_operator')),
  constraint user_roles_pkey primary key (user_id, role)
);

create table if not exists public.houses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id),
  title text not null,
  description text not null,
  city text not null,
  neighborhood text not null,
  address text not null,
  image_url text,
  amenities text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint houses_title_not_blank_check check (char_length(btrim(title)) > 0),
  constraint houses_description_not_blank_check check (char_length(btrim(description)) > 0),
  constraint houses_city_not_blank_check check (char_length(btrim(city)) > 0),
  constraint houses_neighborhood_not_blank_check check (char_length(btrim(neighborhood)) > 0),
  constraint houses_address_not_blank_check check (char_length(btrim(address)) > 0),
  constraint houses_image_url_not_blank_check check (image_url is null or char_length(btrim(image_url)) > 0),
  constraint houses_amenities_no_blank_items_check check (array_position(amenities, '') is null)
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses (id) on delete cascade,
  title text not null,
  price numeric(10, 2) not null,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_title_not_blank_check check (char_length(btrim(title)) > 0),
  constraint rooms_price_positive_check check (price > 0)
);

create table if not exists public.house_members (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint house_members_role_check check (role in ('admin', 'member')),
  constraint house_members_status_check check (status in ('active', 'invited')),
  constraint house_members_house_user_unique unique (house_id, user_id)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses (id) on delete cascade,
  room_id uuid references public.rooms (id) on delete set null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null default '',
  contact_phone text not null default '',
  contact_instagram text,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status_updated_at timestamptz not null default now(),
  constraint applications_message_length_check check (char_length(btrim(message)) >= 12),
  constraint applications_contact_phone_not_blank_check check (char_length(btrim(contact_phone)) > 0),
  constraint applications_contact_instagram_not_blank_check check (contact_instagram is null or char_length(btrim(contact_instagram)) > 0),
  constraint applications_status_check check (status in ('submitted', 'in_review', 'contact_soon', 'rejected')),
  constraint applications_status_updated_after_created_check check (status_updated_at >= created_at)
);

create table if not exists public.monthly_charges (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses (id) on delete cascade,
  title text not null,
  amount numeric(10, 2) not null,
  due_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_charges_title_not_blank_check check (char_length(btrim(title)) > 0),
  constraint monthly_charges_amount_positive_check check (amount > 0)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  charge_id uuid not null references public.monthly_charges (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  amount numeric(10, 2) not null,
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_positive_check check (amount > 0),
  constraint payments_status_check check (status in ('pending', 'paid', 'overdue')),
  constraint payments_paid_at_consistency_check check (
    (status = 'paid' and paid_at is not null) or
    (status in ('pending', 'overdue') and paid_at is null)
  )
);

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id)
  references auth.users (id)
  on delete cascade;

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
