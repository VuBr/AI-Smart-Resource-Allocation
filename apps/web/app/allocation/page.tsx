"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import type { BreadcrumbItem } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  confirmAllocation,
  getActiveAllocationsDetail,
  removeAllocation,
  recommend,
  updateAllocation,
} from "@/lib/services/allocations";
import { listProjects } from "@/lib/services/projects";
import type { AllocationDetail, RecommendationItem } from "@/types";
import { ProjectSelectorBar } from "@/features/allocation/ProjectSelectorBar";
import { RecommendationCard } from "@/features/allocation/RecommendationCard";
import {
  ConfirmAllocationModal,
  type ModalState,
} from "@/features/allocation/ConfirmAllocationModal";
import { ActiveAllocationsTable } from "@/features/allocation/ActiveAllocationsTable";
import {
  ConfirmModal,
  type ConfirmModalState,
} from "@/features/allocation/ConfirmModal";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "ResourceAI" },
  { label: "Allocation", active: true },
];

export default function AllocationPage() {
  useAuthGuard();

  const [selectedProject, setSelectedProject] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loadingRec, setLoadingRec] = useState(false);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [actionModalState, setActionModalState] = useState<ConfirmModalState | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [editPercentage, setEditPercentage] = useState(100);

  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const { data: activeAllocations = [], refetch } = useQuery({
    queryKey: ["allocations-active-detail"],
    queryFn: getActiveAllocationsDetail,
  });

  const selectedProjectObj = projects.find((p) => p.id === selectedProject) ?? null;

  async function handleLoadRecommendations() {
    if (!selectedProject) return;
    setLoadingRec(true);
    try {
      const data = await recommend(selectedProject);
      setRecommendations(data.recommendations);
    } finally {
      setLoadingRec(false);
    }
  }

  function handleOpenModal(item: RecommendationItem) {
    if (!selectedProjectObj) return;
    setModalState({ item, project: selectedProjectObj });
  }

  async function handleConfirm(engineerId: string, percentage: number) {
    setConfirming(true);
    try {
      await confirmAllocation({
        engineer_id: engineerId,
        project_id: selectedProject,
        percentage,
      });
      setRecommendations([]);
      refetch();
    } finally {
      setConfirming(false);
    }
  }

  function handleEditAllocation(allocation: AllocationDetail) {
    setEditPercentage(allocation.percentage);
    setActionModalState({ mode: "edit", allocation });
  }

  function handleRemoveAllocation(allocation: AllocationDetail) {
    setActionModalState({ mode: "remove", allocation });
  }

  async function handleConfirmAction(allocation: AllocationDetail, percentage?: number) {
    setActionBusy(true);
    try {
      if (actionModalState?.mode === "edit") {
        await updateAllocation(allocation.id, {
          percentage: Math.round(percentage ?? allocation.percentage),
          start_date: allocation.start_date,
          end_date: allocation.end_date,
        });
      } else {
        await removeAllocation(allocation.id);
      }
      refetch();
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <AppShell breadcrumbs={breadcrumbs} title="Resource Allocation">
      <div className="px-6 py-7 space-y-6">
        {/* Project selector */}
        <ProjectSelectorBar
          projects={projects}
          selectedId={selectedProject}
          onSelect={(id) => {
            setSelectedProject(id);
            setRecommendations([]);
          }}
          onLoadRecommendations={handleLoadRecommendations}
          loading={loadingRec}
        />

        {/* Recommendations grid */}
        {recommendations.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-700 mb-4">
              AI Recommendations
              <span className="ml-2 text-slate-400 font-medium">({recommendations.length} candidates)</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((item, i) => (
                <RecommendationCard
                  key={item.engineer_id}
                  item={item}
                  rank={i}
                  onConfirm={handleOpenModal}
                />
              ))}
            </div>
          </div>
        )}

        {/* Active allocations table */}
        <ActiveAllocationsTable
          allocations={activeAllocations}
          onEdit={handleEditAllocation}
          onRemove={handleRemoveAllocation}
        />
      </div>

      {/* Confirm modal */}
      <ConfirmAllocationModal
        state={modalState}
        onClose={() => setModalState(null)}
        onConfirm={handleConfirm}
        confirming={confirming}
      />
      <ConfirmModal
        state={actionModalState}
        busy={actionBusy}
        percentage={editPercentage}
        onPercentageChange={setEditPercentage}
        onClose={() => setActionModalState(null)}
        onConfirm={handleConfirmAction}
      />
    </AppShell>
  );
}
