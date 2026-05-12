"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { createProject, listProjects } from "@/lib/services/projects";
import type { CreateProjectRequest } from "@/types";
import { AddProjectModal } from "@/features/projects/AddProjectModal";
import { ProjectFilterTabs, type ProjectTab } from "@/features/projects/ProjectFilterTabs";
import { ProjectsTable } from "@/features/projects/ProjectsTable";

const breadcrumbs = [
  { label: "ResourceAI" },
  { label: "Workspace" },
  { label: "Projects", active: true },
];

function TableSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-1" />
        <div className="h-3 w-64 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="divide-y divide-slate-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-6 py-4 h-14 animate-pulse bg-white" />
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  useAuthGuard();
  const [tab, setTab] = useState<ProjectTab>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: projects = [], isLoading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  });

  const filtered = tab === "all" ? projects : projects.filter((p) => p.status === tab);

  async function handleCreateProject(payload: CreateProjectRequest) {
    setCreateError(null);
    setCreating(true);
    try {
      await createProject(payload);
      setAddOpen(false);
      refetch();
    } catch (error) {
      let message = "Failed to create project.";
      if (error instanceof AxiosError) {
        const apiMessage = (error.response?.data as { error?: { message?: string } } | undefined)
          ?.error?.message;
        message = apiMessage || error.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <AppShell breadcrumbs={breadcrumbs} title="Project Portfolio">
      <div className="px-6 py-7 space-y-6">
        <ProjectFilterTabs active={tab} onChange={setTab} onNewProject={() => setAddOpen(true)} />

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <ProjectsTable projects={filtered} total={projects.length} />
        )}
      </div>
      <AddProjectModal
        open={addOpen}
        creating={creating}
        submitError={createError}
        onClose={() => {
          setAddOpen(false);
          setCreateError(null);
        }}
        onSubmit={handleCreateProject}
      />
    </AppShell>
  );
}
