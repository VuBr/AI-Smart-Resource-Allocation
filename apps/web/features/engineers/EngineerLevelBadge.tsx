import type { EngineerLevel } from "@/types";

const levelConfig: Record<
  EngineerLevel,
  { label: string; dotClass: string; badgeClass: string }
> = {
  junior: {
    label: "Junior",
    dotClass: "bg-slate-400",
    badgeClass: "bg-slate-100 text-slate-600",
  },
  mid: {
    label: "Mid",
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  senior: {
    label: "Senior",
    dotClass: "bg-violet-500",
    badgeClass: "bg-violet-100 text-violet-700",
  },
  lead: {
    label: "Lead",
    dotClass: "bg-indigo-500",
    badgeClass: "bg-indigo-100 text-indigo-700",
  },
};

interface EngineerLevelBadgeProps {
  level: EngineerLevel;
}

export function EngineerLevelBadge({ level }: EngineerLevelBadgeProps) {
  const cfg = levelConfig[level];
  return (
    <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${cfg.badgeClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}
