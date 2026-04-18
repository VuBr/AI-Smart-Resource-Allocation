"use client";

import { AppShell } from "@/components/layout/AppShell";
import type { BreadcrumbItem } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { uploadEngineers } from "@/lib/services/engineers";
import { uploadProjects } from "@/lib/services/projects";
import { UploadZone } from "@/features/upload/UploadZone";
import { CsvColumnReference } from "@/features/upload/CsvColumnReference";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "ResourceAI" },
  { label: "Upload Data", active: true },
];

export default function UploadPage() {
  useAuthGuard();

  return (
    <AppShell breadcrumbs={breadcrumbs} title="Data Import">
      <div className="px-6 py-7 space-y-6">
        {/* Info banner */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
          <div className="flex items-start gap-x-3">
            <svg className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-800">CSV Format Guidelines</p>
              <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-blue-700">
                <div>
                  <p className="font-bold text-blue-800 mb-1">Engineers CSV — required columns:</p>
                  <p>
                    <code className="font-mono bg-blue-100 rounded px-1">name</code>,{" "}
                    <code className="font-mono bg-blue-100 rounded px-1">email</code>,{" "}
                    <code className="font-mono bg-blue-100 rounded px-1">primary_skill</code>,{" "}
                    <code className="font-mono bg-blue-100 rounded px-1">level</code>
                  </p>
                </div>
                <div>
                  <p className="font-bold text-blue-800 mb-1">Projects CSV — columns:</p>
                  <p>
                    <code className="font-mono bg-blue-100 rounded px-1">name</code>{" "}
                    <span className="text-red-500 font-bold">*</span>,{" "}
                    <code className="font-mono bg-blue-100 rounded px-1">description</code>,{" "}
                    <code className="font-mono bg-blue-100 rounded px-1">required_skills</code>,{" "}
                    <code className="font-mono bg-blue-100 rounded px-1">required_level</code>,{" "}
                    <code className="font-mono bg-blue-100 rounded px-1">headcount</code>,{" "}
                    <code className="font-mono bg-blue-100 rounded px-1">status</code>,{" "}
                    <code className="font-mono bg-blue-100 rounded px-1">start_date</code>,{" "}
                    <code className="font-mono bg-blue-100 rounded px-1">end_date</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload zones */}
        <div className="grid grid-cols-2 gap-6">
          <UploadZone type="engineers" onUpload={uploadEngineers} />
          <UploadZone type="projects" onUpload={uploadProjects} />
        </div>

        {/* CSV column reference */}
        <CsvColumnReference />
      </div>
    </AppShell>
  );
}
