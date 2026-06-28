import { useState } from 'react';
import IntakeForm from './components/IntakeForm';
import Dashboard from './components/Dashboard';
import StatsDashboard from './components/StatsDashboard';

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function triggerRefresh() {
    setRefreshTrigger((n) => n + 1);
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-black bg-black sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white text-xs font-bold tracking-[0.25em] uppercase">DetailPace</span>
            <span className="w-px h-4 bg-zinc-600" />
            <span className="text-zinc-400 text-xs tracking-[0.2em] uppercase">Detailing Tracker</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-8 flex flex-col xl:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div className="w-full xl:w-64 xl:flex-shrink-0 xl:sticky xl:top-[57px]">
          <StatsDashboard refreshTrigger={refreshTrigger} />
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0 space-y-8">
          <IntakeForm onVehicleAdded={triggerRefresh} />
          <Dashboard refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}