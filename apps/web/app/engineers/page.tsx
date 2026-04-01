"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { listEngineers } from "@/lib/services/engineers";

export default function EngineersPage() {
  useAuthGuard();
  const { data: engineers = [], isLoading } = useQuery({
    queryKey: ["engineers"],
    queryFn: listEngineers,
  });

  return (
    <AppShell>
      <h2 className="text-xl font-semibold mb-6">Engineers</h2>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Skill</th>
                <th className="text-left px-4 py-3">Level</th>
                <th className="text-left px-4 py-3">Availability</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {engineers.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="px-4 py-3">{e.name}</td>
                  <td className="px-4 py-3">{e.primary_skill}</td>
                  <td className="px-4 py-3 capitalize">{e.level}</td>
                  <td className="px-4 py-3">{e.availability_percentage}%</td>
                  <td className="px-4 py-3">
                    <Link href={`/engineers/${e.id}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {engineers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No engineers found. Upload a CSV to get started.
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
