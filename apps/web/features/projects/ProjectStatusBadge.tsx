import type { ProjectStatus } from "@/types";

const statusConfig: Record<
  ProjectStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  active: {
    label: "Active",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  planned: {
    label: "Planned",
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  closed: {
    label: "Closed",
    dotClass: "bg-slate-400",
    badgeClass: "bg-slate-100 text-slate-600",
  },
};

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${cfg.badgeClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}
