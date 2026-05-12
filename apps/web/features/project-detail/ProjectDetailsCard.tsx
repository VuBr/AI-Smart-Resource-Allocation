import type { Project, AllocationDetail } from "@/types";

interface ProjectDetailsCardProps {
  project: Project;
  allocations: AllocationDetail[];
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(name: string) {
  return (name ?? "").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const avatarColors = [
  "from-indigo-400 to-indigo-600",
  "from-emerald-400 to-emerald-600",
  "from-violet-400 to-violet-600",
  "from-orange-400 to-orange-500",
  "from-pink-400 to-pink-600",
];

export function ProjectDetailsCard({ project, allocations }: ProjectDetailsCardProps) {
  const slotsAvailable = project.headcount - allocations.length;
  const isUnderstaffed = slotsAvailable > 0 && project.status === "active";

  return (
    <div className="col-span-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Project Details</h3>
      </div>
      <div className="p-6 space-y-6">
        {/* Description */}
        {project.description && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Description</p>
            <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>
          </div>
        )}

        {/* Dates */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Timeline</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-x-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(project.start_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-x-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(project.end_date)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Required level */}
        {project.required_level && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Required Level</p>
            <span className="inline-flex items-center rounded-lg bg-violet-100 border border-violet-200 px-2.5 py-1 text-xs font-semibold text-violet-700 capitalize">
              {project.required_level}
            </span>
          </div>
        )}

        {/* Staffing warning */}
        {isUnderstaffed && (
          <div className="flex items-start gap-x-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <svg className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-amber-800">
                {slotsAvailable} slot{slotsAvailable > 1 ? "s" : ""} unfilled
              </p>
              <p className="text-xs text-amber-700 mt-0.5">This project needs more engineers to meet headcount requirements.</p>
            </div>
          </div>
        )}

        {/* Current team */}
        {allocations.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Current Team</p>
            <div className="space-y-2">
              {allocations.map((a, i) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-x-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${avatarColors[i % avatarColors.length]} text-xs font-black text-white`}>
                      {initials(a.engineer_name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{a.engineer_name}</p>
                      <p className="text-xs text-slate-400">{a.percentage}% allocated</p>
                    </div>
                  </div>
                  <div className="h-1.5 w-24 rounded-full bg-slate-200">
                    <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${a.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
