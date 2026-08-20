-- Homekart Postgres Seed Data
-- Run this script in the Supabase SQL Editor AFTER running supabase_schema.sql.

-- Enable Realtime for tables to sync group changes across clients in real-time (safe check)
do $$
begin
  if not exists (
    select 1 from pg_publication_rel pr
    join pg_publication p on p.oid = pr.prpubid
    join pg_class c on c.oid = pr.prrelid
    where p.pubname = 'supabase_realtime' and c.relname = 'groups'
  ) then
    alter publication supabase_realtime add table public.groups;
  end if;

  if not exists (
    select 1 from pg_publication_rel pr
    join pg_publication p on p.oid = pr.prpubid
    join pg_class c on c.oid = pr.prrelid
    where p.pubname = 'supabase_realtime' and c.relname = 'group_members'
  ) then
    alter publication supabase_realtime add table public.group_members;
  end if;

  if not exists (
    select 1 from pg_publication_rel pr
    join pg_publication p on p.oid = pr.prpubid
    join pg_class c on c.oid = pr.prrelid
    where p.pubname = 'supabase_realtime' and c.relname = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;


-- Alter products table to support expires_at
alter table public.products add column if not exists expires_at timestamptz;

-- Clean up any old products and categories that are no longer part of the catalog (removes Ghee and other staples)
delete from public.products where id not in (
  'da7a1000-0000-0000-0000-000000000001',
  'da7a1000-0000-0000-0000-000000000002',
  'da7a1000-0000-0000-0000-000000000003',
  'da7a1000-0000-0000-0000-000000000004',
  'da7a1000-0000-0000-0000-000000000005'
);

delete from public.categories where id not in (
  'ca710000-0000-0000-0000-000000000001',
  'ca730000-0000-0000-0000-000000000003'
);

-- 1. SEED CATEGORIES (using fixed UUIDs for referential reliability)
insert into public.categories (id, name, slug, description, image_url)
values
  ('ca710000-0000-0000-0000-000000000001', 'Salon Products', 'salon-products', 'Professional salon face packs, massage creams, and beauty essentials', 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=200'),
  ('ca730000-0000-0000-0000-000000000003', 'Tech Products', 'tech-products', 'High-quality noise-cancelling headphones, smart fitness wearables, and gadgets', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  image_url = excluded.image_url;

-- 2. SEED PRODUCTS
insert into public.products (id, name, slug, description, category_id, original_price, group_price, stock, image_url, expires_at)
values
  -- Salon Products
  (
    'da7a1000-0000-0000-0000-000000000001',
    'Premium Herbal Face Pack',
    'kashmir-herbal-face-pack',
    'Deep cleansing and rejuvenating herbal face pack enriched with neem, turmeric, and sandalwood extracts for naturally glowing skin.',
    'ca710000-0000-0000-0000-000000000001',
    350,
    249,
    100,
    'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&q=80&w=600',
    now() + interval '48 hours'
  ),
  (
    'da7a1000-0000-0000-0000-000000000002',
    'Nourishing Massage Cream',
    'nourishing-massage-cream',
    'Intense hydration massage cream with vitamin E and aloe vera. Restores skin elasticity, promotes cell renewal, and leaves skin soft and supple.',
    'ca710000-0000-0000-0000-000000000001',
    490,
    349,
    80,
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=600',
    now() + interval '24 hours'
  ),
  (
    'da7a1000-0000-0000-0000-000000000003',
    'Hydrating Hair Spa Cream',
    'hydrating-hair-spa-cream',
    'Deep conditioning hair spa treatment cream that nourishes hair roots, repairs split ends, and controls frizz for silky, shiny hair.',
    'ca710000-0000-0000-0000-000000000001',
    850,
    599,
    120,
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600',
    now() + interval '36 hours'
  ),

  -- Tech Products
  (
    'da7a1000-0000-0000-0000-000000000004',
    'Wireless Noise-Cancelling Headphones',
    'noise-cancelling-headphones',
    'Experience high-fidelity sound and elite active noise cancellation. 40 hours of battery life with comfortable memory foam ear cushions.',
    'ca730000-0000-0000-0000-000000000003',
    2999,
    2499,
    60,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    now() + interval '48 hours'
  ),
  (
    'da7a1000-0000-0000-0000-000000000005',
    'Smart Fitness Smartwatch GPS',
    'smartwatch-gps',
    'Advanced fitness tracker with built-in GPS tracker, heart rate monitor, sleep analysis scoring, and notifications display screen.',
    'ca730000-0000-0000-0000-000000000003',
    3499,
    2899,
    75,
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
    now() - interval '2 hours'
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  category_id = excluded.category_id,
  original_price = excluded.original_price,
  group_price = excluded.group_price,
  stock = excluded.stock,
  image_url = excluded.image_url,
  expires_at = excluded.expires_at;

-- 3. SEED DROP POINTS
insert into public.drop_points (id, name, description, address, area, city, latitude, longitude, phone, opening_hours)
values
  (
    'd70b1000-0000-0000-0000-000000000001',
    'Hiranandani Gardens Point',
    'Managed by Sneha Sharma. Located next to Galleria Shopping Center.',
    'Shop No. 12, Galleria Arcade, Hiranandani Gardens, Powai',
    'Powai',
    'Mumbai',
    19.1176,
    72.9060,
    '+91 98200 12345',
    '9 AM - 9 PM'
  ),
  (
    'd70b1000-0000-0000-0000-000000000002',
    'Chandivali Farm Road Point',
    'Managed by Rajesh Patel. Located at the Raheja Vihar entrance gate.',
    'Building 4A, Raheja Vihar, Chandivali Farm Road, Andheri East',
    'Chandivali',
    'Mumbai',
    19.1090,
    72.8988,
    '+91 98199 54321',
    '8 AM - 10 PM'
  ),
  (
    'd70b1000-0000-0000-0000-000000000003',
    'Andheri East Metro Station Point',
    'Managed by Amit Singh. Located adjacent to the Metro Station exit gate.',
    'Shop 2, Metro Plaza, Kurla Road, Andheri East',
    'Andheri East',
    'Mumbai',
    19.1158,
    72.8564,
    '+91 99300 98765',
    '7 AM - 9 PM'
  ),
  (
    'd70b1000-0000-0000-0000-000000000004',
    'Bandra Carter Road Point',
    'Managed by Priya Mehta. Located next to Cafe Coffee Day.',
    'Flat 101, Sea Breeze Apartments, Carter Road, Bandra West',
    'Bandra West',
    'Mumbai',
    19.0654,
    72.8252,
    '+91 97700 11223',
    '10 AM - 10 PM'
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  address = excluded.address,
  area = excluded.area,
  city = excluded.city,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone = excluded.phone,
  opening_hours = excluded.opening_hours;
