import Link from "next/link";
import type { Engineer } from "@/types";
import { EngineerLevelBadge } from "./EngineerLevelBadge";

interface EngineersTableProps {
  engineers: Engineer[];
  onAddEngineer?: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const avatarColors = [
  "bg-indigo-100 text-indigo-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
  "bg-slate-200 text-slate-600",
  "bg-emerald-100 text-emerald-700",
  "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700",
];

function availabilityBarColor(pct: number, onBench: boolean): string {
  if (onBench) return "bg-emerald-500";
  if (pct === 0) return "bg-red-400";
  if (pct <= 40) return "bg-amber-400";
  return "bg-emerald-500";
}

function benchStartCell(engineer: Engineer) {
  if (!engineer.bench_start_date) {
    return <span className="text-xs font-medium text-slate-400 italic">Fully Allocated</span>;
  }
  const isOnBench = new Date(engineer.bench_start_date) <= new Date();
  if (isOnBench) {
    return (
      <span className="inline-flex items-center gap-x-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        On Bench Now
      </span>
    );
  }
  return (
    <span className="text-sm text-slate-600">
      {new Date(engineer.bench_start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}
    </span>
  );
}

export function EngineersTable({ engineers, onAddEngineer }: EngineersTableProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Table header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Engineers</h2>
          <p className="text-xs text-slate-500 mt-0.5">All team members and their current allocation status</p>
        </div>
        <div className="flex items-center gap-x-2">
          <button className="flex items-center gap-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="h-3.5 w-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" />
            </svg>
            Filter
          </button>
          <button
            onClick={onAddEngineer}
            className="flex items-center gap-x-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/30"
          >
            <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Engineer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/70">
            <tr>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Name</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Skill</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Level</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Availability</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Bench Start</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {engineers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                  No engineers found. Upload a CSV to get started.
                </td>
              </tr>
            ) : (
              engineers.map((engineer, i) => {
                const isOnBench =
                  engineer.bench_start_date !== null &&
                  new Date(engineer.bench_start_date) <= new Date();

                return (
                  <tr
                    key={engineer.id}
                    className={`transition-colors ${i === 0 ? "bg-indigo-50/30" : "hover:bg-slate-50/50"}`}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-x-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${avatarColors[i % avatarColors.length]} text-xs font-bold`}>
                          {initials(engineer.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{engineer.name}</p>
                          <p className="text-xs text-slate-400">{engineer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{engineer.primary_skill}</td>
                    <td className="px-4 py-3.5">
                      <EngineerLevelBadge level={engineer.level} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-x-2">
                        <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${availabilityBarColor(engineer.availability_percentage, isOnBench)}`}
                            style={{ width: `${Math.max(engineer.availability_percentage, 2)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          {engineer.availability_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">{benchStartCell(engineer)}</td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/engineers/${engineer.id}`}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{engineers.length}</span> of{" "}
          <span className="font-semibold text-slate-700">{engineers.length}</span> engineers
        </p>
      </div>
    </div>
  );
}
