"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import type { BreadcrumbItem } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getProject } from "@/lib/services/projects";
import { getActiveAllocationsDetail } from "@/lib/services/allocations";
import { ProjectOverviewBanner } from "@/features/project-detail/ProjectOverviewBanner";
import { ProjectDetailsCard } from "@/features/project-detail/ProjectDetailsCard";
import { ProjectStaffingCard } from "@/features/project-detail/ProjectStaffingCard";
import { ProjectRecommendationsPanel } from "@/features/project-detail/ProjectRecommendationsPanel";

export default function ProjectDetailPage() {
  useAuthGuard();
  const params = useParams();
  const id = params.id as string;
  const [showRecommendations, setShowRecommendations] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id),
    enabled: !!id,
  });

  const { data: allAllocations = [] } = useQuery({
    queryKey: ["allocations-active-detail"],
    queryFn: getActiveAllocationsDetail,
  });

  const projectAllocations = allAllocations.filter((a) => a.project_id === id);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "ResourceAI" },
    { label: "Projects", href: "/projects" },
    { label: project?.name ?? "Detail", active: true },
  ];

  const headerSlot = (
    <button
      onClick={() => setShowRecommendations((v) => !v)}
      className="inline-flex items-center gap-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
      {showRecommendations ? "Hide Recommendations" : "Generate Recommendations"}
    </button>
  );

  return (
    <AppShell breadcrumbs={breadcrumbs} title="Project Detail" headerSlot={headerSlot}>
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-40 rounded-2xl bg-white animate-pulse" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-64 rounded-2xl bg-white animate-pulse" />
            <div className="h-64 rounded-2xl bg-white animate-pulse" />
          </div>
          <div className="h-48 rounded-2xl bg-white animate-pulse" />
        </div>
      ) : project ? (
        <div className="space-y-6">
          <ProjectOverviewBanner project={project} />
          <div className="grid grid-cols-3 gap-6">
            <ProjectDetailsCard project={project} allocations={projectAllocations} />
            <ProjectStaffingCard project={project} allocations={projectAllocations} />
          </div>
          <ProjectRecommendationsPanel
            projectId={id}
            show={showRecommendations}
            onClose={() => setShowRecommendations(false)}
          />
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm px-6 py-10 text-center">
          <p className="text-sm text-slate-400">Project not found.</p>
        </div>
      )}
    </AppShell>
  );
}
