import type { ShortageItem } from "@/types";

interface SkillCoverageTableProps {
  items: ShortageItem[];
}

export function SkillCoverageTable({ items }: SkillCoverageTableProps) {
  const withGaps = items.filter((s) => s.gap > 0).length;
  const covered = items.filter((s) => s.gap <= 0).length;

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Skill Coverage Report</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Required vs available skill capacity across all active and planned projects
          </p>
        </div>
        <button
          disabled
          className="flex items-center gap-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed opacity-60"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/70">
            <tr>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Skill</th>
              <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Required</th>
              <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Available</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Gap</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 w-48">Coverage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                  No skill data available.
                </td>
              </tr>
            ) : (
              items.map((s) => {
                const hasGap = s.gap > 0;
                const coveragePct = s.required > 0
                  ? Math.min(Math.round((s.available / s.required) * 100), 100)
                  : 100;
                const displayPct = s.required > 0
                  ? Math.round((s.available / s.required) * 100)
                  : 100;

                return (
                  <tr key={s.skill} className="hover:bg-slate-50/50 transition-colors">
                    {/* Skill */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-x-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                          <svg className="h-3.5 w-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{s.skill}</span>
                      </div>
                    </td>

                    {/* Required */}
                    <td className="px-4 py-3.5 text-right text-sm font-bold text-slate-900">
                      {s.required}
                    </td>

                    {/* Available */}
                    <td className="px-4 py-3.5 text-right text-sm text-slate-600">
                      {s.available}
                    </td>

                    {/* Gap */}
                    <td className="px-4 py-3.5">
                      {hasGap ? (
                        <div className="flex items-center gap-x-1.5">
                          <svg className="h-3.5 w-3.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                          <span className="text-sm font-bold text-red-600">+{s.gap} gap</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-x-1.5">
                          <svg className="h-3.5 w-3.5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span className="text-sm font-semibold text-emerald-600">
                            {s.available > s.required ? "Surplus" : "Covered"}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Coverage bar */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-x-2.5">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${hasGap ? "bg-red-400" : "bg-emerald-500"}`}
                            style={{ width: `${coveragePct}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-500 shrink-0">
                          {displayPct}%
                        </span>
                      </div>
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
          <span className="font-semibold text-slate-700">{items.length}</span> skills analyzed
          {" · "}
          <span className="font-semibold text-red-600">{withGaps}</span> with gaps
          {" · "}
          <span className="font-semibold text-emerald-600">{covered}</span> fully covered
        </p>
      </div>
    </div>
  );
}
