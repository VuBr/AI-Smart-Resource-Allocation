import type { Project } from "@/types";

interface ProjectSelectorBarProps {
  projects: Project[];
  selectedId: string;
  onSelect: (id: string) => void;
  onLoadRecommendations: () => void;
  loading: boolean;
}

export function ProjectSelectorBar({
  projects,
  selectedId,
  onSelect,
  onLoadRecommendations,
  loading,
}: ProjectSelectorBarProps) {
  const selected = projects.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm px-6 py-5">
      <div className="flex items-center gap-x-4">
        {/* Dropdown */}
        <div className="flex items-center gap-x-3 flex-1">
          <label className="text-sm font-bold text-slate-700 shrink-0">Select Project:</label>
          <div className="relative flex-1 max-w-xs">
            <select
              value={selectedId}
              onChange={(e) => onSelect(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-9 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Project status info */}
        {selected && (
          <div className="flex items-center gap-x-3">
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-x-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-x-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
              </span>
              <span className="font-medium">{selected.name}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-400">{selected.headcount} slot{selected.headcount !== 1 ? "s" : ""}</span>
            </div>
          </div>
        )}

        {/* Load button */}
        <button
          onClick={onLoadRecommendations}
          disabled={!selectedId || loading}
          className="ml-auto flex items-center gap-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
          {loading ? "Loading..." : "Load Recommendations"}
        </button>
      </div>
    </div>
  );
}
