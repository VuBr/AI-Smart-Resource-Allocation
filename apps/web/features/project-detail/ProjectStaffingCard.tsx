import type { Project, AllocationDetail } from "@/types";

interface ProjectStaffingCardProps {
  project: Project;
  allocations: AllocationDetail[];
}

function timelineProgress(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (now <= s) return 0;
  if (now >= e) return 100;
  return Math.round(((now - s) / (e - s)) * 100);
}

export function ProjectStaffingCard({ project, allocations }: ProjectStaffingCardProps) {
  const filled = allocations.length;
  const total = project.headcount;
  const available = Math.max(total - filled, 0);
  const fillPct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const utilization = total > 0 ? Math.round((filled / total) * 100) : 0;
  const timeline = timelineProgress(project.start_date, project.end_date);

  const fillBarColor = fillPct >= 100 ? "bg-emerald-500" : fillPct >= 60 ? "bg-indigo-500" : "bg-amber-400";

  return (
    <div className="col-span-1 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Staffing Progress</h3>
      </div>
      <div className="p-6 space-y-6">
        {/* Slots fill bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Slots Filled</p>
            <span className="text-sm font-black text-slate-900">{filled}/{total}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div
              className={`h-3 rounded-full transition-all ${fillBarColor}`}
              style={{ width: `${Math.min(fillPct, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">{fillPct}% staffed</p>
        </div>

        {/* Timeline bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Project Timeline</p>
            <span className="text-sm font-black text-slate-900">{timeline}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-violet-400 transition-all"
              style={{ width: `${timeline}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">Project elapsed</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Slots</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{total}</p>
          </div>
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Filled</p>
            <p className="mt-1 text-2xl font-black text-indigo-700">{filled}</p>
          </div>
          <div className={`rounded-xl border p-4 ${available > 0 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${available > 0 ? "text-amber-400" : "text-emerald-400"}`}>Available</p>
            <p className={`mt-1 text-2xl font-black ${available > 0 ? "text-amber-700" : "text-emerald-700"}`}>{available}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Utilization</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{utilization}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
