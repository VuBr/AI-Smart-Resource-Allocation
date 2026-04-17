import { useState } from "react";
import type { AllocationDetail } from "@/types";

interface ActiveAllocationsTableProps {
  allocations: AllocationDetail[];
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}

function initials(name: string) {
  return (name ?? "").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const avatarGradients = [
  "from-indigo-400 to-indigo-600",
  "from-emerald-400 to-emerald-600",
  "from-violet-400 to-violet-600",
  "from-amber-400 to-orange-500",
];

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function ActiveAllocationsTable({
  allocations,
  onEdit,
  onRemove,
}: ActiveAllocationsTableProps) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? allocations.filter(
        (a) =>
          a.engineer_name.toLowerCase().includes(search.toLowerCase()) ||
          a.project_name.toLowerCase().includes(search.toLowerCase())
      )
    : allocations;

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-x-3">
          <h3 className="text-sm font-bold text-slate-900">Active Allocations</h3>
          <span className="inline-flex items-center gap-x-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {allocations.length} active
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search allocations..."
            className="rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-medium text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-52"
          />
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50/70">
            <tr>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Engineer</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Project</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Allocation %</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Start Date</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">End Date</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                  {search ? "No results found." : "No active allocations."}
                </td>
              </tr>
            ) : (
              filtered.map((alloc, i) => (
                <tr key={alloc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-x-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br ${avatarGradients[i % avatarGradients.length]} text-xs font-bold text-white`}>
                        {initials(alloc.engineer_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{alloc.engineer_name}</p>
                        <p className="text-xs text-slate-400 capitalize">{alloc.engineer_level} Engineer</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-700">{alloc.project_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-x-3">
                      <div className="w-20">
                        <div className="h-1.5 rounded-full bg-slate-100">
                          <div
                            className="h-1.5 rounded-full bg-indigo-500"
                            style={{ width: `${alloc.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{alloc.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(alloc.start_date)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(alloc.end_date)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-x-1">
                      <button
                        onClick={() => onEdit?.(alloc.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onRemove?.(alloc.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
