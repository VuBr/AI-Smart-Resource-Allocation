"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import type { BreadcrumbItem } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getShortage } from "@/lib/services/reports";
import { SkillGapAlertBanner } from "@/features/reports/SkillGapAlertBanner";
import { SkillStatCards } from "@/features/reports/SkillStatCards";
import { SkillCoverageTable } from "@/features/reports/SkillCoverageTable";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "ResourceAI" },
  { label: "Analytics" },
  { label: "Reports", active: true },
];

export default function ReportsPage() {
  useAuthGuard();

  const { data: shortage = [], isLoading } = useQuery({
    queryKey: ["shortage"],
    queryFn: getShortage,
  });

  const gapItems = shortage.filter((s) => s.gap > 0);
  const gapSkillNames = gapItems.map((s) => s.skill);

  return (
    <AppShell breadcrumbs={breadcrumbs} title="Skill Shortage Analysis">
      {isLoading ? (
        <div className="px-6 py-7 space-y-6">
          <div className="h-16 rounded-2xl bg-white animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-white animate-pulse" />
        </div>
      ) : (
        <div className="px-6 py-7 space-y-6">
          <SkillGapAlertBanner gapCount={gapItems.length} skillNames={gapSkillNames} />
          <SkillStatCards items={shortage} />
          <SkillCoverageTable items={shortage} />
        </div>
      )}
    </AppShell>
  );
}
