"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { confirmAllocation, getActiveAllocations, recommend } from "@/lib/services/allocations";
import { listProjects } from "@/lib/services/projects";
import type { RecommendationItem } from "@/types";

export default function AllocationPage() {
  useAuthGuard();
  const [selectedProject, setSelectedProject] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loadingRec, setLoadingRec] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const { data: active = [], refetch } = useQuery({
    queryKey: ["allocations-active"],
    queryFn: getActiveAllocations,
  });

  async function handleRecommend() {
    if (!selectedProject) return;
    setLoadingRec(true);
    try {
      const data = await recommend(selectedProject);
      setRecommendations(data.recommendations);
    } finally {
      setLoadingRec(false);
    }
  }

  async function handleConfirm(engineerId: string) {
    try {
      await confirmAllocation({
        engineer_id: engineerId,
        project_id: selectedProject,
        percentage: 50,
      });
      setConfirmMsg("Allocation confirmed!");
      refetch();
    } catch {
      setConfirmMsg("Error confirming allocation.");
    }
  }

  return (
    <AppShell>
      <h2 className="text-xl font-semibold mb-6">Allocation</h2>
      <div className="space-y-6">
        <div className="bg-white rounded shadow p-6">
          <h3 className="font-semibold mb-3">Get Recommendations</h3>
          <div className="flex gap-3">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">Select project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={handleRecommend}
              disabled={!selectedProject || loadingRec}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingRec ? "Loading..." : "Get Recommendations"}
            </button>
          </div>
          {recommendations.length > 0 && (
            <ul className="mt-4 space-y-2">
              {recommendations.map((r) => (
                <li key={r.engineer_id} className="flex items-center justify-between border rounded p-3 text-sm">
                  <span>{r.engineer_name} — Score: {(r.score * 100).toFixed(0)}%</span>
                  <button
                    onClick={() => handleConfirm(r.engineer_id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                  >
                    Confirm
                  </button>
                </li>
              ))}
            </ul>
          )}
          {confirmMsg && <p className="mt-3 text-sm text-green-600">{confirmMsg}</p>}
        </div>
        <div className="bg-white rounded shadow p-6">
          <h3 className="font-semibold mb-3">Active Allocations ({active.length})</h3>
          {active.length === 0 ? (
            <p className="text-gray-400 text-sm">No active allocations.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {active.map((a) => (
                <li key={a.id} className="border rounded p-2">
                  Engineer: {a.engineer_id} — Project: {a.project_id} — {a.percentage}%
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
