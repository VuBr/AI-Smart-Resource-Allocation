"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getProject } from "@/lib/services/projects";
import { recommend } from "@/lib/services/allocations";
import type { RecommendationResponse } from "@/types";

export default function ProjectDetailPage() {
  useAuthGuard();
  const params = useParams();
  const id = params.id as string;
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id),
    enabled: !!id,
  });

  async function handleRecommend() {
    setLoading(true);
    try {
      const data = await recommend(id);
      setRecommendations(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <h2 className="text-xl font-semibold mb-6">Project Detail</h2>
      {isLoading ? (
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      ) : project ? (
        <div className="space-y-6">
          <div className="bg-white rounded shadow p-6">
            <h3 className="font-semibold text-lg mb-4">{project.name}</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt className="text-gray-500">Status</dt>
              <dd className="capitalize">{project.status}</dd>
              <dt className="text-gray-500">Required Skills</dt>
              <dd>{project.required_skills ?? "—"}</dd>
              <dt className="text-gray-500">Required Level</dt>
              <dd className="capitalize">{project.required_level ?? "—"}</dd>
              <dt className="text-gray-500">Headcount</dt>
              <dd>{project.headcount}</dd>
            </dl>
            <button
              onClick={handleRecommend}
              disabled={loading}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Recommendations"}
            </button>
          </div>
          {recommendations && (
            <div className="bg-white rounded shadow p-6">
              <h3 className="font-semibold mb-4">Recommendations</h3>
              <ul className="space-y-2 text-sm">
                {recommendations.recommendations.map((r) => (
                  <li key={r.engineer_id} className="border rounded p-3">
                    <span className="font-medium">{r.engineer_name}</span>
                    <span className="ml-2 text-gray-500">Score: {(r.score * 100).toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500">Project not found.</p>
      )}
    </AppShell>
  );
}
