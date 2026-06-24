/*
# Add timer columns to vehicles table

## Summary
Adds three columns to support per-vehicle work-time tracking that excludes break time.

## Modified Tables
- `vehicles`
  - `started_at` (timestamptz, nullable) — timestamp when the current active work segment began (set on Start / Resume, cleared on Break / Done)
  - `break_started_at` (timestamptz, nullable) — timestamp when the current break began; null when not on break
  - `net_work_seconds` (integer, not null, default 0) — accumulated active (non-break) seconds saved to DB on each Break or Done action

## Notes
1. Timer state machine:
   - Start  → set started_at = now(), status = 'In Progress'
   - Break  → net_work_seconds += (now - started_at), started_at = null, break_started_at = now(), status = 'On Break'
   - Resume → started_at = now(), break_started_at = null, status = 'In Progress'
   - Done   → net_work_seconds += (now - started_at), started_at = null, status = 'Completed'
2. The live elapsed display on the client adds (now - started_at) to net_work_seconds in real time.
3. No existing data is altered; new columns default to safe zero/null values.
*/

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS break_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS net_work_seconds integer NOT NULL DEFAULT 0;
