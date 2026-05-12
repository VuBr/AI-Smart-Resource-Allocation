import Link from "next/link";
import type { AllocationDetail } from "@/types";

interface RecentAllocationsTableProps {
  allocations: AllocationDetail[];
}

function initials(name: string) {
  return (name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const avatarColors = [
  "bg-indigo-100 text-indigo-700",
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
];

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function RecentAllocationsTable({ allocations }: RecentAllocationsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <svg className="h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Allocations</h3>
            <p className="text-xs text-slate-400">Active engineer–project assignments</p>
          </div>
        </div>
        <Link
          href="/allocation"
          className="flex items-center gap-x-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
        >
          Manage Allocations
          <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      <table className="min-w-full">
        <thead>
          <tr className="bg-slate-50/70">
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Engineer</th>
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Project</th>
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Allocation</th>
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Start Date</th>
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">End Date</th>
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {allocations.map((alloc, i) => (
            <tr key={alloc.id} className="hover:bg-slate-50/50 transition-colors first:bg-indigo-50/20 first:hover:bg-indigo-50/40">
              <td className="px-6 py-4">
                <div className="flex items-center gap-x-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${avatarColors[i % avatarColors.length]} text-xs font-bold`}>
                    {initials(alloc.engineer_name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{alloc.engineer_name}</p>
                    <p className="text-xs text-slate-400 capitalize">{alloc.engineer_level} · {alloc.engineer_skill}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">{alloc.project_name}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-x-2.5">
                  <div className="h-1.5 w-20 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${alloc.percentage}%` }} />
                  </div>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">{alloc.percentage}%</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">{formatDate(alloc.start_date)}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{formatDate(alloc.end_date)}</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-x-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 flex items-center justify-between">
        <p className="text-xs text-slate-400">Showing {allocations.length} active allocation{allocations.length !== 1 ? "s" : ""}</p>
      </div>
    </div>
  );
}
