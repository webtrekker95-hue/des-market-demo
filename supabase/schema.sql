-- Design Essentials market-routing demo
-- Run this in your Supabase project's SQL editor (a new project, separate
-- from whatever your other active project is using).

create table if not exists products (
  id bigint generated always as identity primary key,
  sku text not null,
  name text not null,
  price_sr numeric(10,2),
  price_gy numeric(10,2),
  stock_sr int not null default 0,
  stock_gy int not null default 0
);

-- Read-only public access: the anon key only needs to SELECT.
alter table products enable row level security;

create policy "Public read access"
  on products for select
  using (true);

-- Seed with real sample data (prices/stock pulled from a staging export,
-- restructured here as flat per-market fields instead of WooCommerce
-- variations).
insert into products (sku, name, price_sr, price_gy, stock_sr, stock_gy) values
  ('40146', 'Compositions Foaming Wrap Lotion', 12.56, 13.77, 48, 30),
  ('30011', 'D/E Olive Oil Relaxer Reg 4lb',    36.05, 40.06, 0,  30),
  ('30088', 'Almond Butter Express Conditioner 2lb', 32.54, 35.79, 33, 0),
  ('40161', 'Bamboo & Silk HCO Leave-In Conditioner', 10.24, 11.41, 19, 30);
