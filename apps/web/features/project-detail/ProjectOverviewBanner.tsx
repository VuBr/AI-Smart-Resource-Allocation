import type { Project } from "@/types";

interface ProjectOverviewBannerProps {
  project: Project;
}

function parseSkills(skills: string | null): string[] {
  if (!skills) return [];
  return skills.split(",").map((s) => s.trim()).filter(Boolean);
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Active" },
  completed: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", label: "Completed" },
  on_hold: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "On Hold" },
  planning: { bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500", label: "Planning" },
};

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const s = new Date(start);
  const e = new Date(end);
  const months = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30));
  return months > 0 ? `${months} months` : "< 1 month";
}

export function ProjectOverviewBanner({ project }: ProjectOverviewBannerProps) {
  const skills = parseSkills(project.required_skills);
  const status = statusConfig[project.status] ?? statusConfig.planning;

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-8 py-8" style={{ background: "linear-gradient(135deg,#eef2ff 0%,#ede9fe 100%)" }}>
        <div className="flex items-start gap-x-6">
          {/* Icon */}
          <div className="shrink-0 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-linear-to-br from-indigo-400 to-violet-600 shadow-lg shadow-indigo-500/30">
            <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>

          {/* Name & meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-x-3 flex-wrap">
              <h2 className="text-2xl font-black text-slate-900">{project.name}</h2>
              <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${status.bg} ${status.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              {project.required_level && (
                <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-700">
                  {project.required_level}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-x-5 text-sm text-slate-500 flex-wrap">
              <span className="flex items-center gap-x-1.5">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                PM: —
              </span>
              <span className="flex items-center gap-x-1.5">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
                Client: —
              </span>
              <span className="flex items-center gap-x-1.5">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDuration(project.start_date, project.end_date)}
              </span>
            </div>

            {/* Skills chips */}
            {skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-indigo-100 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Metadata grid */}
          <div className="shrink-0 grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700 capitalize">{project.status.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Headcount</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">{project.headcount} slots</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start Date</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">{formatDate(project.start_date)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">End Date</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">{formatDate(project.end_date)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
