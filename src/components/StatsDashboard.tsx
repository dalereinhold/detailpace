import { useState } from 'react';
import { BarChart3, Car, RefreshCw, TrendingUp, Clock, Database } from 'lucide-react';
import { useStats } from '../lib/useStats';
import { supabase, VehicleType, VehicleCondition, VehicleStatus } from '../lib/supabase';

interface StatsDashboardProps {
  refreshTrigger: number;
}

const TYPE_CONFIG: Record<VehicleType, { valueClass: string; barClass: string; badgeClass: string }> = {
  New: {
    valueClass: 'text-emerald-600',
    barClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  Used: {
    valueClass: 'text-zinc-500',
    barClass: 'bg-zinc-400',
    badgeClass: 'bg-zinc-100 border-zinc-300 text-zinc-600',
  },
  Demo: {
    valueClass: 'text-sky-600',
    barClass: 'bg-sky-500',
    badgeClass: 'bg-sky-50 border-sky-200 text-sky-700',
  },
};

const TYPES: VehicleType[] = ['New', 'Used', 'Demo'];
const CONDITIONS: VehicleCondition[] = ['Excellent', 'Good', 'Fair', 'Poor'];

const NOTES_POOL = [
  'Full exterior wash and wax requested.',
  'Interior vacuum and leather conditioning.',
  'Remove pet hair from trunk.',
  'Engine bay detailing.',
  'Paint correction on hood scratch.',
  'Windshield water repellent treatment.',
  'Odor eliminator treatment.',
  null,
  null,
];

export default function StatsDashboard({ refreshTrigger }: StatsDashboardProps) {
  const { stats, loading, error, refetch } = useStats(refreshTrigger);
  const [seeding, setSeeding] = useState(false);

  const maxAvg = stats
    ? Math.max(...TYPES.map((t) => stats.byType[t].avgSeconds), 1)
    : 1;

  const lastUpdatedLabel = stats
    ? new Date(stats.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  async function handleSeedData() {
    if (!confirm('Are you sure you want to add 20 randomized vehicles to the database?')) return;
    setSeeding(true);

    const generatedVehicles = [];
    const now = new Date();

    for (let i = 0; i < 20; i++) {
      const type = TYPES[Math.floor(Math.random() * TYPES.length)];
      const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
      
      // 70% Completed, 15% In Progress, 15% On Break
      const randStatus = Math.random();
      const status: VehicleStatus = randStatus < 0.7 ? 'Completed' : randStatus < 0.85 ? 'In Progress' : 'On Break';
      
      const netWorkSeconds = Math.floor(Math.random() * (5400 - 900 + 1)) + 900; // 15 mins to 1.5 hours
      const notes = NOTES_POOL[Math.floor(Math.random() * NOTES_POOL.length)];
      
      // Swedish license plate (e.g., ABC 123 or ABC 12A)
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const digits = '0123456789';
      
      const randomLetters = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
      const randomDigits = Array.from({ length: 2 }, () => digits[Math.floor(Math.random() * digits.length)]).join('');
      
      // Last character is either a digit (80% chance) or a letter (20% chance)
      const lastChar = Math.random() < 0.8 
        ? digits[Math.floor(Math.random() * digits.length)] 
        : letters[Math.floor(Math.random() * letters.length)];
        
      const licensePlate = `${randomLetters} ${randomDigits}${lastChar}`;

      // Random created_at within the last 24 hours
      const hoursAgo = Math.random() * 24;
      const createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();

      generatedVehicles.push({
        license_plate: licensePlate,
        type,
        condition,
        status,
        notes,
        net_work_seconds: status === 'Completed' ? netWorkSeconds : Math.floor(netWorkSeconds / 2),
        started_at: status === 'In Progress' ? new Date(now.getTime() - 10 * 60 * 1000).toISOString() : null,
        break_started_at: status === 'On Break' ? new Date(now.getTime() - 5 * 60 * 1000).toISOString() : null,
        created_at: createdAt,
        updated_at: createdAt,
      });
    }

    const { error: seedError } = await supabase.from('vehicles').insert(generatedVehicles);

    if (seedError) {
      alert(`Failed to seed data: ${seedError.message}`);
    } else {
      refetch();
    }
    setSeeding(false);
  }

  return (
    <aside className="border border-zinc-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-zinc-200 bg-zinc-100">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-black">Statistics</h2>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="text-zinc-400 hover:text-black transition-colors p-1.5 hover:bg-zinc-100"
          aria-label="Refresh stats"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {error && (
          <div className="text-xs text-red-600 border border-red-300 bg-red-50 px-3 py-2">
            Failed to load stats.
          </div>
        )}

        {/* Total processed */}
        <div className="border border-zinc-200 px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Car className="w-3.5 h-3.5 text-zinc-400" />
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Total Processed</p>
          </div>
          {loading && !stats ? (
            <div className="w-12 h-10 bg-zinc-100 animate-pulse" />
          ) : (
            <p className="text-5xl font-black text-black tabular-nums">{stats?.totalProcessed ?? 0}</p>
          )}
          <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest">Completed vehicles</p>
        </div>

        {/* Avg time by type */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Avg Time by Type</p>
          </div>

          <div className="space-y-5">
            {TYPES.map((type) => {
              const cfg = TYPE_CONFIG[type];
              const typeStats = stats?.byType[type];
              const barWidth =
                typeStats && typeStats.avgSeconds > 0
                  ? Math.round((typeStats.avgSeconds / maxAvg) * 100)
                  : 0;

              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider ${cfg.badgeClass}`}>
                        {type}
                      </span>
                      {typeStats && typeStats.count > 0 && (
                        <span className="text-zinc-400 text-xs">{typeStats.count} car{typeStats.count !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className={`w-3 h-3 ${cfg.valueClass} opacity-60`} />
                      {loading && !stats ? (
                        <span className="inline-block w-14 h-4 bg-zinc-100 animate-pulse" />
                      ) : (
                        <span className={`text-sm font-black tabular-nums ${cfg.valueClass}`}>
                          {typeStats?.avgFormatted ?? '--'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-1 bg-zinc-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${cfg.barClass}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seed Data Button */}
        <div className="border-t border-zinc-100 pt-4">
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-zinc-300 hover:border-black text-zinc-500 hover:text-black text-xs font-bold uppercase tracking-widest py-3 transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            {seeding ? 'Seeding...' : 'Seed 20 Demo Cars'}
          </button>
        </div>

        {/* Last updated */}
        {lastUpdatedLabel && (
          <p className="text-zinc-300 text-xs text-center border-t border-zinc-100 pt-4 uppercase tracking-widest">
            Updated {lastUpdatedLabel}
          </p>
        )}
      </div>
    </aside>
  );
}