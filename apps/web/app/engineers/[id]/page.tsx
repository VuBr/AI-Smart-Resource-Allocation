"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import type { BreadcrumbItem } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getBenchForecast, getEngineer } from "@/lib/services/engineers";
import { getActiveAllocationsDetail } from "@/lib/services/allocations";
import { EngineerProfileBanner } from "@/features/engineer-detail/EngineerProfileBanner";
import { EngineerDetailsCard } from "@/features/engineer-detail/EngineerDetailsCard";
import { EngineerBenchForecastPanel } from "@/features/engineer-detail/EngineerBenchForecastPanel";
import { ActiveAllocationsTable } from "@/features/allocation/ActiveAllocationsTable";

export default function EngineerDetailPage() {
  useAuthGuard();
  const params = useParams();
  const id = params.id as string;

  const { data: engineer, isLoading } = useQuery({
    queryKey: ["engineer", id],
    queryFn: () => getEngineer(id),
    enabled: !!id,
  });

  const { data: forecast } = useQuery({
    queryKey: ["bench-forecast", id],
    queryFn: () => getBenchForecast(id),
    enabled: !!id,
  });

  const { data: allAllocations = [] } = useQuery({
    queryKey: ["allocations-active-detail"],
    queryFn: getActiveAllocationsDetail,
  });

  const engineerAllocations = allAllocations.filter((a) => a.engineer_id === id);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "ResourceAI" },
    { label: "Engineers", href: "/engineers" },
    { label: engineer?.name ?? "Profile", active: true },
  ];

  return (
    <AppShell breadcrumbs={breadcrumbs} title="Engineer Profile">
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-40 rounded-2xl bg-white animate-pulse" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-64 rounded-2xl bg-white animate-pulse" />
            <div className="h-64 rounded-2xl bg-white animate-pulse" />
          </div>
          <div className="h-32 rounded-2xl bg-white animate-pulse" />
        </div>
      ) : engineer ? (
        <div className="space-y-6">
          <EngineerProfileBanner engineer={engineer} />
          <EngineerDetailsCard engineer={engineer} allocations={engineerAllocations} />
          <ActiveAllocationsTable allocations={engineerAllocations} />
          {forecast && <EngineerBenchForecastPanel forecast={forecast} />}
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm px-6 py-10 text-center">
          <p className="text-sm text-slate-400">Engineer not found.</p>
        </div>
      )}
    </AppShell>
  );
}
