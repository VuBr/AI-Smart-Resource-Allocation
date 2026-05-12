"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import type { BreadcrumbItem } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getBenchForecast, getEngineer } from "@/lib/services/engineers";
import {
  getActiveAllocationsDetail,
  removeAllocation,
  updateAllocation,
} from "@/lib/services/allocations";
import type { AllocationDetail } from "@/types";
import { EngineerProfileBanner } from "@/features/engineer-detail/EngineerProfileBanner";
import { EngineerDetailsCard } from "@/features/engineer-detail/EngineerDetailsCard";
import { EngineerBenchForecastPanel } from "@/features/engineer-detail/EngineerBenchForecastPanel";
import { ActiveAllocationsTable } from "@/features/allocation/ActiveAllocationsTable";
import {
  ConfirmModal,
  type ConfirmModalState,
} from "@/features/allocation/ConfirmModal";

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

  const { data: allAllocations = [], refetch: refetchAllocations } = useQuery({
    queryKey: ["allocations-active-detail"],
    queryFn: getActiveAllocationsDetail,
  });
  const [actionModalState, setActionModalState] = useState<ConfirmModalState | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [editPercentage, setEditPercentage] = useState(100);

  const engineerAllocations = allAllocations.filter((a) => a.engineer_id === id);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "ResourceAI" },
    { label: "Engineers", href: "/engineers" },
    { label: engineer?.name ?? "Profile", active: true },
  ];

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
      refetchAllocations();
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <AppShell breadcrumbs={breadcrumbs} title="Engineer Profile">
      {isLoading ? (
        <div className="px-6 py-7 space-y-6">
          <div className="h-40 rounded-2xl bg-white animate-pulse" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-64 rounded-2xl bg-white animate-pulse" />
            <div className="h-64 rounded-2xl bg-white animate-pulse" />
          </div>
          <div className="h-32 rounded-2xl bg-white animate-pulse" />
        </div>
      ) : engineer ? (
        <div className="px-6 py-7 space-y-6">
          <EngineerProfileBanner engineer={engineer} />
          <EngineerDetailsCard engineer={engineer} allocations={engineerAllocations} />
          <ActiveAllocationsTable
            allocations={engineerAllocations}
            onEdit={handleEditAllocation}
            onRemove={handleRemoveAllocation}
          />
          {forecast && <EngineerBenchForecastPanel forecast={forecast} />}
          <ConfirmModal
            state={actionModalState}
            busy={actionBusy}
            percentage={editPercentage}
            onPercentageChange={setEditPercentage}
            onClose={() => setActionModalState(null)}
            onConfirm={handleConfirmAction}
          />
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm px-6 py-10 text-center">
          <p className="text-sm text-slate-400">Engineer not found.</p>
        </div>
      )}
    </AppShell>
  );
}
