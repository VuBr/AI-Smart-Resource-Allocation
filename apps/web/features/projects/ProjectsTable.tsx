import Link from "next/link";
import type { Project, ProjectStatus } from "@/types";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { ProjectSkillTags } from "./ProjectSkillTags";

interface ProjectsTableProps {
  projects: Project[];
  total: number;
}

const levelConfig: Record<string, { dotClass: string; badgeClass: string }> = {
  junior: { dotClass: "bg-slate-400", badgeClass: "bg-slate-100 text-slate-600" },
  mid: { dotClass: "bg-blue-500", badgeClass: "bg-blue-100 text-blue-700" },
  senior: { dotClass: "bg-violet-500", badgeClass: "bg-violet-100 text-violet-700" },
  lead: { dotClass: "bg-indigo-500", badgeClass: "bg-indigo-100 text-indigo-700" },
};

function LevelBadge({ level }: { level: string | null }) {
  if (!level) return <span className="text-xs text-slate-400">—</span>;
  const cfg = levelConfig[level.toLowerCase()] ?? levelConfig.mid;
  const label = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
  return (
    <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${cfg.badgeClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
      {label}
    </span>
  );
}

function ProjectIcon() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
      <svg className="h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    </div>
  );
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusSummary({ projects }: { projects: Project[] }) {
  const active = projects.filter((p) => p.status === "active").length;
  const planned = projects.filter((p) => p.status === "planned").length;

  return (
    <div className="flex items-center gap-x-2 text-xs text-slate-500">
      {active > 0 && (
        <span className="inline-flex items-center gap-x-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {active} Active
        </span>
      )}
      {planned > 0 && (
        <span className="inline-flex items-center gap-x-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {planned} Planned
        </span>
      )}
    </div>
  );
}

export function ProjectsTable({ projects, total }: ProjectsTableProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Projects</h2>
          <p className="text-xs text-slate-500 mt-0.5">All projects and their required engineering resources</p>
        </div>
        <StatusSummary projects={projects} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/70">
            <tr>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Project</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Required Skills</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Level</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Slots</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Start Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">End Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                  No projects found.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-x-3">
                      <ProjectIcon />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{project.name}</p>
                        {project.description && (
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">{project.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <ProjectSkillTags skills={project.required_skills} />
                  </td>
                  <td className="px-4 py-3.5">
                    <LevelBadge level={project.required_level} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-bold text-slate-900">{project.headcount}</span>
                    <span className="text-xs text-slate-400 ml-0.5">slots</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                    {formatDate(project.start_date)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                    {formatDate(project.end_date)}
                  </td>
                  <td className="px-4 py-3.5">
                    <ProjectStatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{projects.length}</span> of{" "}
          <span className="font-semibold text-slate-700">{total}</span> projects
        </p>
      </div>
    </div>
  );
}
