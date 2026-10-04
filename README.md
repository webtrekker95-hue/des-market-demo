# Design Essentials — market routing demo

A throwaway demo to walk the owner through the Suriname/Guyana market-routing
logic before anything touches the live site. Plain HTML/CSS/JS, no build
step. Four real products from the staging export, restructured to the
original plan (flat per-market price/stock fields, not WooCommerce
variations).

## 1. Supabase — new project, not your existing one

Use a **new** free Supabase project for this, so it doesn't touch whatever
your other active project is doing.

1. supabase.com → New project
2. Once it's created, go to the SQL editor and paste the contents of
   `supabase/schema.sql`, then run it. This creates the `products` table,
   sets it to public-read-only, and seeds the 4 sample products.
3. Go to Project settings → API. Copy the **Project URL** and the **anon
   public** key.
4. Open `script.js` and replace:
   ```js
   const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
   with the values you copied. The anon key is meant to be public in
   client-side code — it only works because the table's RLS policy only
   allows SELECT, nothing else.

## 2. GitHub

From this folder:
```bash
git init
git add .
git commit -m "Market routing demo"
git branch -M main
git remote add origin https://github.com/<your-username>/des-market-demo.git
git push -u origin main
```
(Create the empty `des-market-demo` repo on GitHub first, no README/license
— just paste the commands above.)

## 3. Vercel

1. vercel.com → Add New → Project → import the `des-market-demo` repo
2. Framework preset: **Other** (it's static files, no build command needed)
3. Leave build command and output directory blank/default — deploy
4. Vercel gives you a public `https://des-market-demo-<something>.vercel.app`
   URL — that's what you send the owner. Works from anywhere, no account
   needed on their end.

## What to point out to the owner

- Landing page: two doors in, no location picker
- Pick Guyana, notice price and stock differ from Suriname for the same
  product (Compositions Foaming Wrap Lotion is the clearest example)
- Try the Olive Oil Relaxer in Suriname — it's out of stock there but
  available in Guyana, so "Add to cart" is disabled on that side
- Add a couple of items, hit Pay, see the tax rate switch (10% vs 14%) and
  the gateway label change
- "Switch market" mid-cart to see the cart-clearing confirmation — this is
  the rule that keeps an order from mixing two markets' tax/gateway

## Known gaps (fine for a demo, not for the live build)

- Gateway labels are placeholders — swap in your real Suriname/Guyana
  gateway names when this logic moves to WooCommerce
- No real payment is processed anywhere
- Stock isn't actually decremented on "purchase" — it's just for show
