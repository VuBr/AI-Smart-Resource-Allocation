import type { ShortageItem } from "@/types";

interface SkillStatCardsProps {
  items: ShortageItem[];
}

export function SkillStatCards({ items }: SkillStatCardsProps) {
  const total = items.length;
  const withGaps = items.filter((s) => s.gap > 0).length;
  const covered = items.filter((s) => s.gap <= 0).length;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Total Skills Tracked */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Skills Tracked</p>
            <p className="text-3xl font-bold text-slate-900 mt-1 leading-none">{total}</p>
            <p className="text-xs text-slate-400 mt-1.5">across all projects</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
            <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Skills with Gaps */}
      <div className="rounded-2xl bg-white border border-red-200 shadow-sm px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Skills with Gaps</p>
            <p className="text-3xl font-bold text-red-600 mt-1 leading-none">{withGaps}</p>
            <p className="text-xs text-red-400 mt-1.5">demand exceeds capacity</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Fully Covered */}
      <div className="rounded-2xl bg-white border border-emerald-200 shadow-sm px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Fully Covered</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1 leading-none">{covered}</p>
            <p className="text-xs text-emerald-500 mt-1.5">sufficient capacity</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
            <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
