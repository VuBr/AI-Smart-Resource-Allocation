"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getShortage } from "@/lib/services/reports";

export default function ReportsPage() {
  useAuthGuard();
  const { data: shortage = [], isLoading } = useQuery({
    queryKey: ["shortage"],
    queryFn: getShortage,
  });

  return (
    <AppShell>
      <h2 className="text-xl font-semibold mb-6">Skill Shortage Report</h2>
      {isLoading ? (
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Skill</th>
                <th className="text-left px-4 py-3">Required</th>
                <th className="text-left px-4 py-3">Available</th>
                <th className="text-left px-4 py-3">Gap</th>
              </tr>
            </thead>
            <tbody>
              {shortage.map((s, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3">{s.skill}</td>
                  <td className="px-4 py-3">{s.required}</td>
                  <td className="px-4 py-3">{s.available}</td>
                  <td className={`px-4 py-3 font-medium ${s.gap > 0 ? "text-red-600" : "text-green-600"}`}>
                    {s.gap > 0 ? `+${s.gap}` : s.gap}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t">
            <button className="text-sm text-gray-400 border rounded px-3 py-1" disabled>
              Export (placeholder)
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
