create table if not exists profiles (
  id uuid primary key,
  name text not null,
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists houses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id),
  title text not null,
  description text not null,
  city text not null,
  neighborhood text not null,
  address text not null,
  image_url text,
  amenities text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses (id) on delete cascade,
  title text not null,
  price numeric(10, 2) not null,
  available boolean not null default true
);

create table if not exists house_members (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses (id) on delete cascade,
  user_id uuid not null references profiles (id),
  role text not null check (role in ('admin', 'member')),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (house_id, user_id)
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses (id) on delete cascade,
  room_id uuid references rooms (id) on delete set null,
  user_id uuid not null references profiles (id),
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists monthly_charges (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses (id) on delete cascade,
  title text not null,
  amount numeric(10, 2) not null,
  due_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  charge_id uuid not null references monthly_charges (id) on delete cascade,
  user_id uuid not null references profiles (id),
  amount numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table profiles
  drop constraint if exists profiles_id_fkey;

alter table profiles
  add constraint profiles_id_fkey
  foreign key (id)
  references auth.users (id)
  on delete cascade;

alter table profiles enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own"
  on profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own"
  on profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own"
  on profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
