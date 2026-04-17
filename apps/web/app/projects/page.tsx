"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { listProjects } from "@/lib/services/projects";
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

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  });

  const filtered = tab === "all" ? projects : projects.filter((p) => p.status === tab);

  return (
    <AppShell breadcrumbs={breadcrumbs} title="Project Portfolio">
      <div className="px-6 py-7 space-y-6">
        <ProjectFilterTabs active={tab} onChange={setTab} />

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <ProjectsTable projects={filtered} total={projects.length} />
        )}
      </div>
    </AppShell>
  );
}
