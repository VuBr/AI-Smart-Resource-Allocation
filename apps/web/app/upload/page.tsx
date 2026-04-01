"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { uploadEngineers } from "@/lib/services/engineers";
import { uploadProjects } from "@/lib/services/projects";
import type { CsvImportResult } from "@/types";

function UploadForm({
  label,
  onUpload,
}: {
  label: string;
  onUpload: (file: File) => Promise<CsvImportResult>;
}) {
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await onUpload(file);
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="bg-white rounded shadow p-6">
      <h3 className="font-semibold mb-3">{label}</h3>
      <input type="file" accept=".csv" onChange={handleChange} disabled={loading} className="text-sm" />
      {loading && <p className="mt-2 text-sm text-gray-400">Uploading...</p>}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {result && (
        <div className="mt-3 text-sm">
          <p>Inserted: {result.inserted} | Updated: {result.updated} | Skipped: {result.skipped}</p>
          {result.errors.length > 0 && <p className="text-red-500">Errors: {result.errors.join(", ")}</p>}
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  useAuthGuard();
  return (
    <AppShell>
      <h2 className="text-xl font-semibold mb-6">Upload Data</h2>
      <div className="space-y-6">
        <UploadForm label="Upload Engineers CSV" onUpload={uploadEngineers} />
        <UploadForm label="Upload Projects CSV" onUpload={uploadProjects} />
      </div>
    </AppShell>
  );
}
