import type { ProjectStatus } from "@/types";

export type ProjectTab = "all" | ProjectStatus;

const tabs: { value: ProjectTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "planned", label: "Planned" },
  { value: "closed", label: "Closed" },
];

interface ProjectFilterTabsProps {
  active: ProjectTab;
  onChange: (tab: ProjectTab) => void;
  onNewProject?: () => void;
}

export function ProjectFilterTabs({ active, onChange, onNewProject }: ProjectFilterTabsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="rounded-xl border border-slate-200 bg-white p-1 w-fit shadow-sm flex items-center gap-x-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
              active === tab.value
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <button
        onClick={onNewProject}
        className="flex items-center gap-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/30"
      >
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        New Project
      </button>
    </div>
  );
}
