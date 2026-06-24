import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type VehicleStatus = 'In Progress' | 'On Break' | 'Completed';
export type VehicleType = 'New' | 'Used' | 'Demo';
export type VehicleCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface Vehicle {
  id: string;
  license_plate: string;
  type: VehicleType;
  condition: VehicleCondition;
  status: VehicleStatus;
  notes: string | null;
  started_at: string | null;
  break_started_at: string | null;
  net_work_seconds: number;
  created_at: string;
  updated_at: string;
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}
