import Link from "next/link";
import type { Project, ProjectStatus } from "@/types";

interface ProjectStatusCardProps {
  projects: Project[];
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; dotClass: string; textClass: string; countClass: string; rowClass: string }
> = {
  active: {
    label: "Active",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-800",
    countClass: "text-emerald-700",
    rowClass: "bg-emerald-50 border border-emerald-100",
  },
  planned: {
    label: "Planned",
    dotClass: "bg-blue-500",
    textClass: "text-blue-800",
    countClass: "text-blue-700",
    rowClass: "bg-blue-50 border border-blue-100",
  },
  closed: {
    label: "Closed",
    dotClass: "bg-slate-400",
    textClass: "text-slate-600",
    countClass: "text-slate-500",
    rowClass: "bg-slate-50 border border-slate-200",
  },
};

const statusOrder: ProjectStatus[] = ["active", "planned", "closed"];

export function ProjectStatusCard({ projects }: ProjectStatusCardProps) {
  const counts = projects.reduce<Record<ProjectStatus, number>>(
    (acc, p) => ({ ...acc, [p.status]: (acc[p.status] ?? 0) + 1 }),
    { active: 0, planned: 0, closed: 0 }
  );

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5 flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Project Status</h3>
        <Link href="/projects" className="text-xs font-semibold text-indigo-600 hover:underline">
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {statusOrder.map((status) => {
          const cfg = statusConfig[status];
          return (
            <div
              key={status}
              className={`flex items-center justify-between rounded-lg ${cfg.rowClass} px-3 py-2.5`}
            >
              <div className="flex items-center gap-x-2">
                <span className={`h-2 w-2 rounded-full ${cfg.dotClass}`} />
                <span className={`text-xs font-semibold ${cfg.textClass}`}>{cfg.label}</span>
              </div>
              <span className={`text-lg font-black ${cfg.countClass}`}>{counts[status]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
