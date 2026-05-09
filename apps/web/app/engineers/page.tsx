"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { createEngineer, listEngineers } from "@/lib/services/engineers";
import type { CreateEngineerRequest } from "@/types";
import { EngineerStatsBar } from "@/features/engineers/EngineerStatsBar";
import { AddEngineerModal } from "@/features/engineers/AddEngineerModal";
import { EngineersTable } from "@/features/engineers/EngineersTable";

const breadcrumbs = [
  { label: "ResourceAI" },
  { label: "Workspace" },
  { label: "Engineers", active: true },
];

function EngineersHeaderSlot({ search, onSearchChange }: { search: string; onSearchChange: (v: string) => void }) {
  const router = useRouter();
  return (
    <>
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search engineers…"
          className="h-9 w-56 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-colors"
        />
      </div>

      {/* Import Data */}
      <button
        onClick={() => router.push("/upload")}
        className="flex items-center gap-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
      >
        <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Import Data
      </button>
    </>
  );
}

export default function EngineersPage() {
  useAuthGuard();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: engineers = [], isLoading, refetch } = useQuery({
    queryKey: ["engineers"],
    queryFn: listEngineers,
  });

  const filtered = search.trim()
    ? engineers.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.primary_skill.toLowerCase().includes(search.toLowerCase())
      )
    : engineers;

  async function handleCreateEngineer(payload: CreateEngineerRequest) {
    setCreateError(null);
    setCreating(true);
    try {
      await createEngineer(payload);
      setAddOpen(false);
      refetch();
    } catch (error) {
      let message = "Failed to create engineer.";
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
    <AppShell
      breadcrumbs={breadcrumbs}
      title="Team Roster"
      headerSlot={<EngineersHeaderSlot search={search} onSearchChange={setSearch} />}
    >
      <div className="px-6 py-7 space-y-6">
        {isLoading ? (
          <div className="flex items-center gap-x-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-11 w-36 rounded-xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <EngineerStatsBar engineers={engineers} />
        )}

        {isLoading ? (
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-64 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4 h-14 bg-white animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <EngineersTable engineers={filtered} onAddEngineer={() => setAddOpen(true)} />
        )}
      </div>
      <AddEngineerModal
        open={addOpen}
        creating={creating}
        submitError={createError}
        onClose={() => {
          setAddOpen(false);
          setCreateError(null);
        }}
        onSubmit={handleCreateEngineer}
      />
    </AppShell>
  );
}
