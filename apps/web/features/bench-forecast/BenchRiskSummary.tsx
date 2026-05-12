import type { BenchForecastItem } from "@/types";

interface BenchRiskSummaryProps {
  items: BenchForecastItem[];
}

export function BenchRiskSummary({ items }: BenchRiskSummaryProps) {
  const high = items.filter((i) => i.risk_level === "high").length;
  const medium = items.filter((i) => i.risk_level === "medium").length;
  const low = items.filter((i) => i.risk_level === "low").length;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* High Risk */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden flex">
        <div className="w-1 shrink-0 bg-red-500" />
        <div className="flex items-center gap-x-4 px-5 py-4 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">High Risk</p>
            <p className="text-2xl font-bold text-red-600 leading-none mt-0.5">{high}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">engineers at risk</p>
          </div>
        </div>
      </div>

      {/* Medium Risk */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden flex">
        <div className="w-1 shrink-0 bg-amber-400" />
        <div className="flex items-center gap-x-4 px-5 py-4 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
            <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Medium Risk</p>
            <p className="text-2xl font-bold text-amber-600 leading-none mt-0.5">{medium}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">engineers at risk</p>
          </div>
        </div>
      </div>

      {/* Low Risk */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden flex">
        <div className="w-1 shrink-0 bg-emerald-400" />
        <div className="flex items-center gap-x-4 px-5 py-4 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Low Risk</p>
            <p className="text-2xl font-bold text-emerald-600 leading-none mt-0.5">{low}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">engineers at risk</p>
          </div>
        </div>
      </div>
    </div>
  );
}
