"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getStats } from "@/lib/services/dashboard";

export default function DashboardPage() {
  useAuthGuard();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getStats,
  });

  return (
    <AppShell>
      <h2 className="text-xl font-semibold mb-6">Dashboard</h2>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Engineers" value={stats?.total_engineers ?? 0} />
          <StatCard label="On Bench" value={stats?.engineers_on_bench ?? 0} />
          <StatCard label="Active Projects" value={stats?.active_projects ?? 0} />
          <StatCard label="Allocation Rate" value={`${stats?.allocation_rate_percentage ?? 0}%`} />
        </div>
      )}
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
