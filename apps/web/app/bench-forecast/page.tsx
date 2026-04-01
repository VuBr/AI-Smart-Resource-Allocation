"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getForecast } from "@/lib/services/bench";

export default function BenchForecastPage() {
  useAuthGuard();
  const { data: forecasts = [], isLoading } = useQuery({
    queryKey: ["bench-forecast"],
    queryFn: getForecast,
  });

  return (
    <AppShell>
      <h2 className="text-xl font-semibold mb-6">Bench Forecast</h2>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Engineer</th>
                <th className="text-left px-4 py-3">Risk Level</th>
                <th className="text-left px-4 py-3">Probability</th>
                <th className="text-left px-4 py-3">Days Until Bench</th>
                <th className="text-left px-4 py-3">Alert</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map((f) => (
                <tr key={f.engineer_id} className="border-t">
                  <td className="px-4 py-3">{f.engineer_name}</td>
                  <td className="px-4 py-3 capitalize">{f.risk_level}</td>
                  <td className="px-4 py-3">{(f.probability * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3">{f.days_until_bench ?? "—"}</td>
                  <td className="px-4 py-3">{f.is_alert ? "⚠ Yes" : "No"}</td>
                </tr>
              ))}
              {forecasts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No forecast data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
