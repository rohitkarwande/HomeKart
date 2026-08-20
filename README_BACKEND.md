# Homekart Backend & Database Integration Documentation

This document outlines the database schema, security policies, environment parameters, and service architecture configured for **Homekart**.

---

## 1. Relational Database Schema
We created a 20-entity PostgreSQL schema designed to run on **Supabase**. The tables, columns, relations, and index columns are defined inside [`supabase_schema.sql`](file:///d:/HomeKart/supabase_schema.sql).

### SQL Scripts Location:
- **Database Schema**: [`supabase_schema.sql`](file:///d:/HomeKart/supabase_schema.sql)
- **Seed Catalog Data**: [`supabase_seed.sql`](file:///d:/HomeKart/supabase_seed.sql)

---

## 2. Supabase Setup Instructions
To deploy the database schema and seed data on your Supabase instance:
1. Open your **Supabase Project Dashboard**.
2. Navigate to the **SQL Editor** tab from the left sidebar.
3. Click **New Query** -> **Blank Query**.
4. Open [`supabase_schema.sql`](file:///d:/HomeKart/supabase_schema.sql), copy its entire content, paste it into the editor, and click **Run**.
5. Create another query, copy the contents of [`supabase_seed.sql`](file:///d:/HomeKart/supabase_seed.sql), paste it, and click **Run**.

This sets up all the tables, relations, triggers, indexes, and RLS policies, and inserts seed data for categories, products, and drop points.

---

## 3. Environment Variables
To connect the frontend client to your Supabase instance, create a file named `.env` in the root workspace folder with the following keys:

```env
VITE_SUPABASE_URL=https://<your-project-reference-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-project-anon-public-key>
```

*(See [`.env.example`](file:///d:/HomeKart/.env.example) for a template).*

---

## 4. Architecture Layering
The application uses a strict architectural layout to separate user interfaces from raw queries:

```
[ UI Pages / Components ]
        ↓
[ Zustand Context Provider ] (src/store/homekartStore.tsx)
        ↓
[ Service Access layer ]     (src/services/*Service.ts)
        ↓
[ Supabase Client SDK ]      (src/services/supabaseClient.ts)
        ↓
[ Supabase PostgreSQL ]      (Postgres DB)
```

---

## 5. Development Fallback Mode (Dual-Mode Client)
To prevent the application from crashing on launch when environment variables are not supplied or are set to default values, the services layer utilizes a **Dual-Mode Fallback**:
- The client [`supabaseClient.ts`](file:///d:/HomeKart/src/services/supabaseClient.ts) checks if `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are defined and valid.
- If **not configured**, the service layers automatically default to a fully functional mock storage implementation powered by `localStorage` and `seedData.ts`.
- If **configured**, the services perform real, persistent asynchronous network queries to the Supabase PostgreSQL database tables.

---

## 6. Authentication Setup
- **Supabase Phone Authentication**: The website expects a mobile number and OTP entry.
- **SMS SMS Provider**: You can configure an SMS provider (like Twilio or MessageBird) inside **Auth Providers** -> **Phone** on the Supabase dashboard to send real SMS verification codes.
- **Testing Sandbox Bypass**: For development testing, we implemented a verification bypass. If you enter OTP code `123456` or `840840`, the client will auto-verify the login session, creating or syncing the matching profile record in the database.

---

## 7. Row Level Security (RLS) & Access Constraints
All tables have Row Level Security enabled. Policies ensure that:
- Users can read all public `products`, `categories`, and `drop_points`.
- Users can insert/read group memberships, but unique indexes prevent a user from joining the same group twice.
- Users can only read and write their own `orders`, `order_items`, `payments`, and `cart_items`.
- Leaders can only read and write their own metrics and withdrawals logs. Users cannot modify another leader's application or balance.
- Triggers automatically synchronize new signups in `auth.users` to create a matching profile row in `public.profiles`.

---

## 8. Simulated Gateways & Triggers
To maintain the visual, community-driven wow factor of the application:
- **Friend Simulation**: Clicking "Invite Friends (Simulate)" on the group details page generates a mock user profile in `public.profiles` and inserts a membership record into `group_members` for the group. The member progress bar updates in real time.
- **Group Completion**: If a group hits the target of 5/5 members, the group status transitions to `confirmed`. Any active checkout orders linked to this group will automatically update status, triggering a simulated supplier ready-for-pickup event notification 8 seconds later.
- **Leader Payout Simulation**: Leaders can request earnings withdrawals. This appends a withdrawal record to the ledger, recalculating the leader's balance.
