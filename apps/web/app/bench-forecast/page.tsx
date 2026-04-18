"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import type { BreadcrumbItem } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getForecast } from "@/lib/services/bench";
import { BenchRiskSummary } from "@/features/bench-forecast/BenchRiskSummary";
import { BenchForecastTable } from "@/features/bench-forecast/BenchForecastTable";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "ResourceAI" },
  { label: "Analytics" },
  { label: "Bench Forecast", active: true },
];

const aiAccuracyChip = (
  <div className="hidden items-center gap-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:flex">
    <svg className="h-3.5 w-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
    AI Model · 89.2% accuracy
  </div>
);

export default function BenchForecastPage() {
  useAuthGuard();

  const { data: forecasts = [], isLoading } = useQuery({
    queryKey: ["bench-forecast"],
    queryFn: getForecast,
  });

  return (
    <AppShell breadcrumbs={breadcrumbs} title="AI-Powered Predictions" headerSlot={aiAccuracyChip}>
      {isLoading ? (
        <div className="px-6 py-7 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-white animate-pulse" />
        </div>
      ) : (
        <div className="px-6 py-7 space-y-6">
          <BenchRiskSummary items={forecasts} />
          <BenchForecastTable items={forecasts} />
        </div>
      )}
    </AppShell>
  );
}
