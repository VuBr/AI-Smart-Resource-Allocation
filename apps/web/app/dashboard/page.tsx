"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getStats } from "@/lib/services/dashboard";
import { getAlerts } from "@/lib/services/bench";
import { getActiveAllocationsDetail } from "@/lib/services/allocations";
import { listProjects } from "@/lib/services/projects";
import { KpiCard } from "@/features/dashboard/KpiCard";
import { BenchAlertsTable } from "@/features/dashboard/BenchAlertsTable";
import { WorkforceUtilization } from "@/features/dashboard/WorkforceUtilization";
import { ProjectStatusCard } from "@/features/dashboard/ProjectStatusCard";
import { RecentAllocationsTable } from "@/features/dashboard/RecentAllocationsTable";

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-40 rounded-2xl bg-white border border-slate-200/80 animate-pulse" />
      ))}
    </div>
  );
}

function SectionSkeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-2xl bg-white border border-slate-200/80 animate-pulse ${className}`} />;
}

const breadcrumbs = [{ label: "ResourceAI" }, { label: "Dashboard", active: true }];

export default function DashboardPage() {
  useAuthGuard();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getStats,
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["bench-alerts"],
    queryFn: getAlerts,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  });

  const { data: allocations = [], isLoading: allocsLoading } = useQuery({
    queryKey: ["allocations-detail"],
    queryFn: getActiveAllocationsDetail,
  });

  return (
    <AppShell breadcrumbs={breadcrumbs} title="Overview">
      <div className="px-6 py-7 space-y-6">
        {/* Section heading */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Resource Overview</h2>
            <p className="text-sm text-slate-500 mt-0.5">Q1 2025 · Last updated 2 minutes ago</p>
          </div>
          <button className="flex items-center gap-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        {statsLoading || !stats ? (
          <KpiSkeleton />
        ) : (
          <div className="grid grid-cols-4 gap-5">
            <KpiCard
              label="Total Engineers"
              value={stats.total_engineers}
              trend="+8.3%"
              trendLabel="vs last month"
              trendUp
              barWidth="100%"
              barColor="bg-indigo-500"
              iconBg="bg-indigo-600"
              iconShadow="shadow-md shadow-indigo-500/30"
              icon={
                <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              }
            />
            <KpiCard
              label="On Bench"
              value={stats.engineers_on_bench}
              trend="+1"
              trendLabel="from last week"
              trendUp={false}
              barWidth={`${Math.round((stats.engineers_on_bench / Math.max(stats.total_engineers, 1)) * 100)}%`}
              barColor="bg-red-500"
              iconBg="bg-red-500"
              iconShadow="shadow-md shadow-red-500/30"
              icon={
                <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              }
            />
            <KpiCard
              label="Active Projects"
              value={stats.active_projects}
              trend="+3"
              trendLabel="this quarter"
              trendUp
              barWidth="66%"
              barColor="bg-blue-500"
              iconBg="bg-blue-500"
              iconShadow="shadow-md shadow-blue-500/30"
              icon={
                <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                </svg>
              }
            />
            <KpiCard
              label="Allocation Rate"
              value={`${stats.allocation_rate_percentage.toFixed(1)}%`}
              trend="+4.2%"
              trendLabel="vs last month"
              trendUp
              barWidth={`${Math.round(stats.allocation_rate_percentage)}%`}
              barColor="bg-emerald-500"
              iconBg="bg-emerald-500"
              iconShadow="shadow-md shadow-emerald-500/30"
              icon={
                <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
              }
            />
          </div>
        )}

        {/* Middle row */}
        <div className="grid grid-cols-3 gap-5">
          {alertsLoading ? (
            <SectionSkeleton className="col-span-2 h-72" />
          ) : (
            <BenchAlertsTable alerts={alerts} />
          )}

          <div className="flex flex-col gap-y-4">
            {statsLoading || !stats ? (
              <SectionSkeleton className="h-36" />
            ) : (
              <WorkforceUtilization
                totalEngineers={stats.total_engineers}
                onBench={stats.engineers_on_bench}
                partiallyAvailable={stats.partially_available}
              />
            )}
            {projectsLoading ? (
              <SectionSkeleton className="flex-1" />
            ) : (
              <ProjectStatusCard projects={projects} />
            )}
          </div>
        </div>

        {/* Recent Allocations */}
        {allocsLoading ? (
          <SectionSkeleton className="h-64" />
        ) : (
          <RecentAllocationsTable allocations={allocations} />
        )}
      </div>
    </AppShell>
  );
}
