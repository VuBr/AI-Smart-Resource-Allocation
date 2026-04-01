"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getBenchForecast, getEngineer } from "@/lib/services/engineers";

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

  return (
    <AppShell>
      <h2 className="text-xl font-semibold mb-6">Engineer Detail</h2>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ) : engineer ? (
        <div className="space-y-6">
          <div className="bg-white rounded shadow p-6">
            <h3 className="font-semibold text-lg mb-4">{engineer.name}</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt className="text-gray-500">Primary Skill</dt>
              <dd>{engineer.primary_skill}</dd>
              <dt className="text-gray-500">Level</dt>
              <dd className="capitalize">{engineer.level}</dd>
              <dt className="text-gray-500">Experience</dt>
              <dd>{engineer.years_of_experience} years</dd>
              <dt className="text-gray-500">Availability</dt>
              <dd>{engineer.availability_percentage}%</dd>
              <dt className="text-gray-500">Bench Start</dt>
              <dd>{engineer.bench_start_date ?? "—"}</dd>
            </dl>
          </div>
          {forecast && (
            <div className="bg-white rounded shadow p-6">
              <h3 className="font-semibold mb-4">Bench Forecast</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <dt className="text-gray-500">Risk Level</dt>
                <dd className="capitalize">{forecast.risk_level}</dd>
                <dt className="text-gray-500">Probability</dt>
                <dd>{(forecast.probability * 100).toFixed(0)}%</dd>
                <dt className="text-gray-500">Days Until Bench</dt>
                <dd>{forecast.days_until_bench ?? "—"}</dd>
                <dt className="text-gray-500">Alert</dt>
                <dd>{forecast.is_alert ? "Yes" : "No"}</dd>
              </dl>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500">Engineer not found.</p>
      )}
    </AppShell>
  );
}
