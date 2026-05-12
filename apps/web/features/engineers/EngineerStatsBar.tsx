import type { Engineer } from "@/types";

interface EngineerStatsBarProps {
  engineers: Engineer[];
}

export function EngineerStatsBar({ engineers }: EngineerStatsBarProps) {
  const total = engineers.length;
  const allocated = engineers.filter((e) => e.availability_percentage === 0).length;
  const partiallyAvailable = engineers.filter(
    (e) => e.availability_percentage > 0 && e.availability_percentage < 100 && !e.bench_start_date
  ).length;
  const onBench = engineers.filter((e) => e.bench_start_date !== null).length;

  return (
    <div className="flex items-center gap-x-3">
      <div className="flex items-center gap-x-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
          <svg className="h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <span className="text-xs font-medium text-slate-500">Total</span>
        <span className="text-sm font-bold text-slate-900">{total}</span>
        <span className="text-xs text-slate-400">engineers</span>
      </div>

      <div className="flex items-center gap-x-2.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
        <span className="text-xs font-medium text-indigo-600">Allocated</span>
        <span className="text-sm font-bold text-indigo-700">{allocated}</span>
      </div>

      <div className="flex items-center gap-x-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
        <span className="text-xs font-medium text-amber-600">Partially Available</span>
        <span className="text-sm font-bold text-amber-700">{partiallyAvailable}</span>
      </div>

      <div className="flex items-center gap-x-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
        <span className="text-xs font-medium text-red-600">On Bench</span>
        <span className="text-sm font-bold text-red-700">{onBench}</span>
      </div>
    </div>
  );
}
