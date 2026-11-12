# Atmosfere Living — atmosfere-living.in

E-commerce store for Atmosfere's furniture and home decor line. Design tokens (Marcellus + Jost, ivory/charcoal/bronze palette, wordmark) mirror [atmosfere.in](https://www.atmosfere.in).

**Stack:** Next.js 15 (App Router) · Supabase (Postgres, Auth, Storage) · Tailwind CSS 4

## What's included

| Area | Routes |
| --- | --- |
| Storefront | `/` home, `/shop` (category, search, sort), `/products/[slug]` (gallery, wishlist, reviews), `/cart`, `/checkout` |
| Auth | `/login` (Google + email magic link), `/auth/callback` |
| Customer dashboard | `/account` overview, orders + order tracking/cancel, wishlist, addresses, profile |
| Admin dashboard | `/admin` KPIs + 30‑day revenue, orders (status, payment, tracking), products (CRUD, image upload), categories, customers (roles, block), reviews (moderation), discounts & offers |

Security lives in the database: Row Level Security on every table, and orders are created by the `place_order` Postgres function, which recalculates prices, stock, discount and shipping on the server. The browser can't change totals.

Until Supabase keys are set, the storefront runs on a built-in demo catalogue (`src/lib/demo-data.ts`) so you can preview the design.

## Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com) (region: Mumbai `ap-south-1`).
2. **SQL Editor** → run `supabase/migrations/0001_schema.sql`, then `supabase/seed.sql`.
3. Copy `.env.local.example` → `.env.local` and fill in the URL and anon key (Project Settings → API).

### 2. Google sign-in
1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Create credentials → **OAuth client ID** → *Web application*.
2. **Authorised JavaScript origins:** `http://localhost:3000`, `https://atmosfere-living.in`
3. **Authorised redirect URI:** `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Supabase → **Authentication → Sign In / Providers → Google** → enable, paste the Client ID and Secret.
5. Supabase → **Authentication → URL Configuration**:
   - Site URL: `https://atmosfere-living.in`
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://atmosfere-living.in/auth/callback`

### 3. Make yourself an admin
Sign in once, then run in the SQL editor:
```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

### 4. Run
```bash
npm install
npm run dev
```

## Notes
- **Node 20.16:** Tailwind is pinned to 4.1.18 because newer releases need Node ≥ 20.19. Upgrading to Node 22 lets you lift the pin; Supabase also recommends Node 22.
- **Payments:** checkout supports Cash/UPI on delivery and bank transfer. "Card, UPI & netbanking" is shown as coming soon; it's ready for a gateway such as Razorpay, which would set `payment_status` on `orders`.
- **Shipping:** free above ₹5,000, otherwise ₹250. Set in `place_order` (SQL) and `src/lib/utils.ts`.
- Cancelling an order (by the customer or an admin) restocks its items automatically. Cancelled orders can't be reopened.
