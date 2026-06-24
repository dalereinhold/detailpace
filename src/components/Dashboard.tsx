import { useEffect, useState } from 'react';
import { LayoutGrid, Clock, Coffee, CheckCircle2, RefreshCw, Hourglass } from 'lucide-react';
import { supabase, Vehicle, VehicleStatus } from '../lib/supabase';
import VehicleCard from './VehicleCard';

interface DashboardProps {
  refreshTrigger: number;
}

type FilterValue = VehicleStatus | 'All' | 'Pending';

const STATUS_FILTERS: { label: string; value: FilterValue; icon: React.ReactNode }[] = [
  { label: 'All', value: 'All', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { label: 'Pending', value: 'Pending', icon: <Hourglass className="w-3.5 h-3.5" /> },
  { label: 'In Progress', value: 'In Progress', icon: <Clock className="w-3.5 h-3.5" /> },
  { label: 'On Break', value: 'On Break', icon: <Coffee className="w-3.5 h-3.5" /> },
  { label: 'Completed', value: 'Completed', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
];

function isPending(v: Vehicle) {
  return v.status === 'In Progress' && !v.started_at && v.net_work_seconds === 0;
}

export default function Dashboard({ refreshTrigger }: DashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>('All');

  async function fetchVehicles() {
    setLoading(true);
    setError(null);
    const { data, error: dbError } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) { setError(dbError.message); }
    else { setVehicles((data as Vehicle[]) ?? []); }
    setLoading(false);
  }

  useEffect(() => { fetchVehicles(); }, [refreshTrigger]);

  const filtered =
    filter === 'All'
      ? vehicles
      : filter === 'Pending'
      ? vehicles.filter(isPending)
      : vehicles.filter((v) => v.status === filter && !isPending(v));

  const counts = {
    All: vehicles.length,
    Pending: vehicles.filter(isPending).length,
    'In Progress': vehicles.filter((v) => v.status === 'In Progress' && !isPending(v)).length,
    'On Break': vehicles.filter((v) => v.status === 'On Break').length,
    Completed: vehicles.filter((v) => v.status === 'Completed').length,
  };

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-black">Active Queue</h2>
          <p className="text-zinc-400 text-xs mt-1">
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in queue
          </p>
        </div>
        <button
          onClick={fetchVehicles}
          className="flex items-center gap-2 text-zinc-500 hover:text-black text-xs font-semibold uppercase tracking-widest border border-zinc-200 hover:border-black px-4 py-2.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-zinc-200 border border-zinc-200 mb-6">
        <StatPill label="Total" count={counts['All']} valueClass="text-black" />
        <StatPill label="Pending" count={counts['Pending']} valueClass="text-zinc-500" />
        <StatPill label="In Progress" count={counts['In Progress']} valueClass="text-sky-600" />
        <StatPill label="On Break" count={counts['On Break']} valueClass="text-amber-500" />
        <StatPill label="Completed" count={counts['Completed']} valueClass="text-emerald-600" />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-px bg-zinc-200 border border-zinc-200 mb-8">
        {STATUS_FILTERS.map(({ label, value, icon }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${
              filter === value
                ? 'bg-black text-white'
                : 'bg-white text-zinc-400 hover:text-black hover:bg-zinc-50'
            }`}
          >
            {icon}
            {label}
            <span
              className={`text-xs font-bold px-1.5 py-0.5 ${
                filter === value ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              {counts[value as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="border border-red-400 bg-red-50 text-red-700 px-4 py-3 text-sm mb-6">
          Failed to load vehicles: {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-zinc-200 h-72 animate-pulse bg-zinc-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-zinc-100">
          <LayoutGrid className="w-8 h-8 text-zinc-200 mb-4" />
          <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest">No Vehicles</p>
          <p className="text-zinc-300 text-xs mt-1">
            {filter === 'All'
              ? 'Add a vehicle using the intake form above.'
              : filter === 'Pending'
              ? 'No vehicles waiting to be started.'
              : `No vehicles with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onUpdated={fetchVehicles} />
          ))}
        </div>
      )}
    </section>
  );
}

function StatPill({ label, count, valueClass }: { label: string; count: number; valueClass: string }) {
  return (
    <div className="bg-white px-4 py-3">
      <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-2xl font-black tabular-nums ${valueClass}`}>{count}</p>
    </div>
  );
}
