/*
# Create vehicles table (single-tenant, no auth)

## Summary
Creates a `vehicles` table to track cars moving through a detailing shop workflow.

## New Tables
- `vehicles`
  - `id` (uuid, primary key)
  - `license_plate` (text, not null) — the vehicle's license plate number
  - `type` (text, not null) — one of: 'New', 'Used', 'Demo'
  - `condition` (text, not null) — one of: 'Excellent', 'Good', 'Fair', 'Poor'
  - `status` (text, not null, default 'In Progress') — one of: 'In Progress', 'On Break', 'Completed'
  - `notes` (text) — optional technician notes
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

## Security
- RLS enabled on `vehicles`
- anon + authenticated users can SELECT, INSERT, UPDATE, DELETE (single-tenant shop app, intentionally shared/public)

## Notes
1. No user_id — this is a shared, single-tenant shop floor app; all staff see all vehicles.
2. Status transitions are managed entirely by the frontend.
*/

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_plate text NOT NULL,
  type text NOT NULL CHECK (type IN ('New', 'Used', 'Demo')),
  condition text NOT NULL CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Poor')),
  status text NOT NULL DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'On Break', 'Completed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_vehicles" ON vehicles;
CREATE POLICY "anon_select_vehicles" ON vehicles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_vehicles" ON vehicles;
CREATE POLICY "anon_insert_vehicles" ON vehicles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_vehicles" ON vehicles;
CREATE POLICY "anon_update_vehicles" ON vehicles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_vehicles" ON vehicles;
CREATE POLICY "anon_delete_vehicles" ON vehicles FOR DELETE
  TO anon, authenticated USING (true);
