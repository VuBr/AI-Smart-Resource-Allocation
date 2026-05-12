interface UtilizationBarProps {
  label: string;
  count: number;
  total: number;
  barClass: string;
}

function UtilizationBar({ label, count, total, barClass }: UtilizationBarProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">
          {count} / {total}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface WorkforceUtilizationProps {
  totalEngineers: number;
  onBench: number;
  partiallyAvailable: number;
}

export function WorkforceUtilization({
  totalEngineers,
  onBench,
  partiallyAvailable,
}: WorkforceUtilizationProps) {
  const allocated = totalEngineers - onBench;

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Workforce Utilization</h3>
      <div className="space-y-3">
        <UtilizationBar
          label="Allocated Engineers"
          count={allocated}
          total={totalEngineers}
          barClass="bg-gradient-to-r from-indigo-600 to-indigo-500"
        />
        <UtilizationBar
          label="On Bench"
          count={onBench}
          total={totalEngineers}
          barClass="bg-red-500"
        />
        <UtilizationBar
          label="Partially Available"
          count={partiallyAvailable}
          total={totalEngineers}
          barClass="bg-amber-400"
        />
      </div>
    </div>
  );
}
