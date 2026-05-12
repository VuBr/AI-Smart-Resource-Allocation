interface SkillGapAlertBannerProps {
  gapCount: number;
  skillNames?: string[];
}

export function SkillGapAlertBanner({ gapCount, skillNames }: SkillGapAlertBannerProps) {
  if (gapCount === 0) return null;

  const detail = skillNames && skillNames.length > 0
    ? `${skillNames.join(", ")} demand exceeds current team capacity. Immediate hiring or upskilling recommended.`
    : "Demand exceeds current team capacity. Immediate hiring or upskilling recommended.";

  return (
    <div className="flex items-start gap-x-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
        <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-red-800">{gapCount} Critical Skill Gap{gapCount !== 1 ? "s" : ""}</p>
        <p className="text-xs text-red-600 mt-0.5">{detail}</p>
      </div>
      <div className="flex shrink-0 items-center gap-x-2">
        <span className="inline-flex items-center gap-x-1.5 rounded-full bg-red-100 border border-red-200 px-2.5 py-1 text-[11px] font-bold text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {gapCount} gap{gapCount !== 1 ? "s" : ""} detected
        </span>
      </div>
    </div>
  );
}
