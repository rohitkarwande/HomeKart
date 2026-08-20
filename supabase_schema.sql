-- Homekart Postgres Relational Database Schema
-- Paste this script into the Supabase SQL Editor and click Run.

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. DROP EXISTING TABLES AND TRIGGERS IF THEY EXIST
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.leader_earnings cascade;
drop table if exists public.leader_applications cascade;
drop table if exists public.leaders cascade;
drop table if exists public.notifications cascade;
drop table if exists public.referral_earnings cascade;
drop table if exists public.referrals cascade;
drop table if exists public.payments cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.monthly_basket_items cascade;
drop table if exists public.monthly_baskets cascade;
drop table if exists public.cart_items cascade;
drop table if exists public.carts cascade;
drop table if exists public.group_members cascade;
drop table if exists public.groups cascade;
drop table if exists public.drop_points cascade;
drop table if exists public.product_images cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;

-- 3. CREATE TABLES

-- PROFILES: Associated with auth.users
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text unique,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CATEGORIES
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  original_price integer not null, -- INR
  group_price integer not null, -- INR
  stock integer default 100,
  is_active boolean default true,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PRODUCT IMAGES
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  image_url text not null,
  display_order integer default 0
);

-- DROP POINTS
create table public.drop_points (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  address text not null,
  area text not null,
  city text not null,
  latitude double precision,
  longitude double precision,
  phone text,
  opening_hours text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- GROUPS
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  creator_id uuid references public.profiles(id) on delete set null,
  group_price integer not null,
  target_members integer default 5,
  status text not null default 'open' check (status in ('open', 'joining', 'almost_full', 'confirmed', 'supplier_confirmed', 'ready_for_pickup', 'completed', 'cancelled', 'refunded')),
  expires_at timestamptz not null,
  drop_point_id uuid references public.drop_points(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- GROUP MEMBERS
create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  quantity integer not null default 1,
  joined_at timestamptz default now(),
  status text not null default 'joined',
  unique (group_id, user_id)
);

-- CARTS
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CART ITEMS
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  quantity integer not null default 1,
  is_group_buy boolean default false,
  group_id uuid references public.groups(id) on delete set null,
  unique (cart_id, product_id, is_group_buy, group_id)
);

-- MONTHLY BASKETS
create table public.monthly_baskets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MONTHLY BASKET ITEMS
create table public.monthly_basket_items (
  id uuid primary key default gen_random_uuid(),
  basket_id uuid references public.monthly_baskets(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  quantity integer not null default 1,
  unique (basket_id, product_id)
);

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  group_id uuid references public.groups(id) on delete set null,
  drop_point_id uuid references public.drop_points(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'payment_pending', 'paid', 'group_pending', 'group_confirmed', 'supplier_confirmed', 'ready_for_pickup', 'picked_up', 'completed', 'cancelled', 'refunded')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'processing', 'successful', 'failed', 'cancelled', 'refund_initiated', 'refunded')),
  subtotal integer not null,
  group_savings integer not null,
  total_amount integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDER ITEMS
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1,
  unit_price integer not null,
  total_price integer not null
);

-- PAYMENTS
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  payment_method text not null,
  transaction_id text,
  amount integer not null,
  status text not null check (status in ('pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded')),
  created_at timestamptz default now()
);

-- REFERRALS
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references public.profiles(id) on delete cascade,
  referred_user_id uuid references public.profiles(id) on delete cascade,
  referral_code text not null,
  status text default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz default now(),
  unique (referrer_id, referred_user_id)
);

-- REFERRAL EARNINGS
create table public.referral_earnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  referral_id uuid references public.referrals(id) on delete set null,
  amount integer not null,
  status text not null default 'credited' check (status in ('credited', 'pending', 'withdrawn')),
  created_at timestamptz default now()
);

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  related_entity_type text,
  related_entity_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- LEADERS
create table public.leaders (
  id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'inactive' check (status in ('inactive', 'pending', 'under_review', 'active', 'rejected')),
  earnings integer default 0,
  balance integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- LEADER APPLICATIONS
create table public.leader_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  mobile text not null,
  area text not null,
  preferred_drop_point_id uuid references public.drop_points(id) on delete set null,
  experience text,
  availability text,
  status text default 'pending' check (status in ('pending', 'under_review', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- LEADER EARNINGS LEDGER
create table public.leader_earnings (
  id uuid primary key default gen_random_uuid(),
  leader_id uuid references public.leaders(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  amount integer not null,
  type text not null check (type in ('commission', 'referral', 'adjustment', 'withdrawal')),
  status text not null default 'credited' check (status in ('credited', 'pending', 'withdrawn')),
  created_at timestamptz default now()
);

-- 4. DATABASE INDEXING FOR QUERIES
create index idx_products_category_id on public.products(category_id);
create index idx_products_slug on public.products(slug);
create index idx_groups_product_id on public.groups(product_id);
create index idx_groups_status on public.groups(status);
create index idx_group_members_group_id on public.group_members(group_id);
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);

-- 5. TRIGGER FOR AUTOMATIC PROFILE CREATION ON USER SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.phone, new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.drop_points enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.monthly_baskets enable row level security;
alter table public.monthly_basket_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_earnings enable row level security;
alter table public.notifications enable row level security;
alter table public.leaders enable row level security;
alter table public.leader_applications enable row level security;
alter table public.leader_earnings enable row level security;

-- 7. DEFINE RLS POLICIES

-- profiles
create policy "Public read profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- categories (Read-only for public)
create policy "Public read categories" on public.categories for select using (true);

-- products (Read-only for public)
create policy "Public read products" on public.products for select using (true);

-- product_images (Read-only for public)
create policy "Public read product_images" on public.product_images for select using (true);

-- drop_points (Read-only for public)
create policy "Public read drop_points" on public.drop_points for select using (true);

-- groups (Read-only for public, insert for authenticated)
create policy "Public read groups" on public.groups for select using (true);
create policy "Authenticated users can create groups" on public.groups for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update groups" on public.groups for update using (auth.role() = 'authenticated');

-- group_members (Read-only for public, write for self)
create policy "Public read group_members" on public.group_members for select using (true);
create policy "Users can join groups as self" on public.group_members for insert with check (auth.uid() = user_id);
create policy "Users can update own group membership" on public.group_members for update using (auth.uid() = user_id);
create policy "Users can leave own group" on public.group_members for delete using (auth.uid() = user_id);

-- carts & cart_items (Self-only)
create policy "Users can access own cart" on public.carts for all using (auth.uid() = user_id);
create policy "Users can access own cart items" on public.cart_items for all using (
  exists (select 1 from public.carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
);

-- monthly_baskets & monthly_basket_items (Self-only)
create policy "Users can access own monthly basket" on public.monthly_baskets for all using (auth.uid() = user_id);
create policy "Users can access own monthly basket items" on public.monthly_basket_items for all using (
  exists (select 1 from public.monthly_baskets where monthly_baskets.id = monthly_basket_items.basket_id and monthly_baskets.user_id = auth.uid())
);

-- orders & order_items (Self-only)
create policy "Users can read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Users can update own orders" on public.orders for update using (auth.uid() = user_id);
create policy "Users can read own order items" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Users can insert own order items" on public.order_items for insert with check (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- payments (Self-only)
create policy "Users can view own payments" on public.payments for select using (
  exists (select 1 from public.orders where orders.id = payments.order_id and orders.user_id = auth.uid())
);
create policy "Users can submit own payments" on public.payments for insert with check (
  exists (select 1 from public.orders where orders.id = payments.order_id and orders.user_id = auth.uid())
);

-- referrals & referral_earnings (Self-only)
create policy "Users can view own referrals" on public.referrals for select using (auth.uid() = referrer_id or auth.uid() = referred_user_id);
create policy "Users can view own referral earnings" on public.referral_earnings for select using (auth.uid() = user_id);

-- notifications (Self-only)
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- leaders, leader_applications, and leader_earnings
create policy "Public read active leaders" on public.leaders for select using (status = 'active');
create policy "Users can read own leader status" on public.leaders for select using (auth.uid() = id);
create policy "Users can read own leader applications" on public.leader_applications for select using (auth.uid() = user_id);
create policy "Users can submit leader applications" on public.leader_applications for insert with check (auth.uid() = user_id);
create policy "Users can update own leader applications" on public.leader_applications for update using (auth.uid() = user_id);
create policy "Leaders can view own earnings ledger" on public.leader_earnings for select using (auth.uid() = leader_id);
