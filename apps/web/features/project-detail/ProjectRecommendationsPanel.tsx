"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecommendations, confirmAllocation } from "@/lib/services/allocations";
import { RecommendationCard } from "@/features/allocation/RecommendationCard";
import type { RecommendationItem } from "@/types";

interface ProjectRecommendationsPanelProps {
  projectId: string;
  show: boolean;
  onClose: () => void;
}

export function ProjectRecommendationsPanel({ projectId, show, onClose }: ProjectRecommendationsPanelProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["recommendations", projectId],
    queryFn: () => getRecommendations(projectId),
    enabled: show,
  });

  const { mutate: confirm } = useMutation({
    mutationFn: (item: RecommendationItem) =>
      confirmAllocation({ project_id: projectId, engineer_id: item.engineer_id, percentage: 100 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations-active-detail"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations", projectId] });
    },
  });

  if (!show) return null;

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100" style={{ background: "linear-gradient(135deg,#eef2ff 0%,#ede9fe 100%)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Recommendations</h3>
              <p className="text-xs text-slate-400">Best-fit engineers for this project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-slate-400 text-center py-6">Failed to load recommendations.</p>
        ) : !data?.recommendations?.length ? (
          <p className="text-sm text-slate-400 text-center py-6">No recommendations available.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {data.recommendations.map((item, i) => (
              <RecommendationCard key={item.engineer_id} item={item} rank={i} onConfirm={confirm} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
