import { useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase, VehicleType, VehicleCondition } from '../lib/supabase';

interface IntakeFormProps {
  onVehicleAdded: () => void;
}

const VEHICLE_TYPES: VehicleType[] = ['New', 'Used', 'Demo'];
const CONDITIONS: VehicleCondition[] = ['Excellent', 'Good', 'Fair', 'Poor'];

export default function IntakeForm({ onVehicleAdded }: IntakeFormProps) {
  const [licensePlate, setLicensePlate] = useState('');
  const [type, setType] = useState<VehicleType>('New');
  const [condition, setCondition] = useState<VehicleCondition>('Good');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLicensePlateChange(val: string) {
    // Remove all non-alphanumeric characters and convert to uppercase
    const clean = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Format as "ABC 123" or "ABC 12A" (insert space after 3rd character)
    let formatted = clean;
    if (clean.length > 3) {
      formatted = `${clean.slice(0, 3)} ${clean.slice(3, 6)}`;
    } else {
      formatted = clean.slice(0, 3);
    }
    
    setLicensePlate(formatted);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = licensePlate.trim();
    
    if (!trimmed) {
      setError('License plate is required.');
      return;
    }

    // Swedish license plate validation: 3 letters, a space, and either 3 digits or 2 digits + 1 letter
    const swedishPlateRegex = /^[A-Z]{3} \d{2}[A-Z0-9]$/;
    if (!swedishPlateRegex.test(trimmed)) {
      setError('Please enter a valid Swedish license plate (e.g., ABC 123 or ABC 12A).');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: dbError } = await supabase.from('vehicles').insert({
      license_plate: trimmed,
      type,
      condition,
      notes: notes.trim() || null,
      status: 'In Progress',
    });

    setLoading(false);
    if (dbError) { setError(dbError.message); return; }

    setLicensePlate('');
    setType('New');
    setCondition('Good');
    setNotes('');
    onVehicleAdded();
  }

  const inputClass =
    'w-full bg-zinc-100 border border-zinc-300 text-black text-base rounded-none px-3 py-3 focus:outline-none focus:border-black transition-colors placeholder-zinc-400';
  const labelClass = 'block text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1.5';

  return (
    <section className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 bg-zinc-100 px-6 py-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-black">Vehicle Intake</h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelClass} htmlFor="licensePlate">License Plate</label>
            <input
              id="licensePlate"
              type="text"
              className={`${inputClass} uppercase tracking-widest font-bold text-lg`}
              placeholder="ABC 123"
              value={licensePlate}
              onChange={(e) => handleLicensePlateChange(e.target.value)}
              maxLength={7}
              autoComplete="off"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="type">Vehicle Type</label>
            <select
              id="type"
              className={`${inputClass} cursor-pointer`}
              value={type}
              onChange={(e) => setType(e.target.value as VehicleType)}
            >
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="condition">Condition</label>
            <select
              id="condition"
              className={`${inputClass} cursor-pointer`}
              value={condition}
              onChange={(e) => setCondition(e.target.value as VehicleCondition)}
            >
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-5">
          <label className={labelClass} htmlFor="notes">
            Notes <span className="text-zinc-400 normal-case tracking-normal font-normal">— optional</span>
          </label>
          <input
            id="notes"
            type="text"
            className={inputClass}
            placeholder="Special instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && (
          <div className="mb-4 border border-red-400 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-black hover:bg-zinc-800 active:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-widest px-6 py-3 transition-colors rounded-none"
        >
          <Plus className="w-4 h-4" />
          {loading ? 'Adding...' : 'Add to Queue'}
        </button>
      </form>
    </section>
  );
}