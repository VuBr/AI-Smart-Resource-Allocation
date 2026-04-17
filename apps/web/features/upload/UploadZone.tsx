"use client";

import { useRef, useState } from "react";
import type { CsvImportResult } from "@/types";

type UploadZoneType = "engineers" | "projects";

interface UploadZoneProps {
  type: UploadZoneType;
  onUpload: (file: File) => Promise<CsvImportResult>;
}

type ZoneState = "idle" | "selected" | "uploading" | "success" | "error";

const config = {
  engineers: {
    label: "Engineers CSV",
    description: "Import or update engineer profiles",
    accentBg: "bg-indigo-600",
    accentShadow: "shadow-indigo-500/20",
    dropBorder: "border-indigo-300",
    dropBg: "bg-indigo-50/50",
    dropBorderActive: "border-indigo-400",
    dropBgActive: "bg-indigo-50",
    fileBg: "bg-indigo-50 border-indigo-200",
    fileIconColor: "text-indigo-500",
    fileHoverBg: "hover:bg-indigo-100",
    uploadIcon: (
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    readyBadge: { bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500", label: "Ready" },
    importedBadge: { bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500", label: "Ready" },
    btnClass: "bg-indigo-600 shadow-indigo-500/20 hover:bg-indigo-700",
    uploadLabel: "Upload Engineers CSV",
  },
  projects: {
    label: "Projects CSV",
    description: "Import or update project records",
    accentBg: "bg-emerald-600",
    accentShadow: "shadow-emerald-500/20",
    dropBorder: "border-slate-300",
    dropBg: "bg-slate-50/50",
    dropBorderActive: "border-emerald-400",
    dropBgActive: "bg-emerald-50",
    fileBg: "bg-emerald-50 border-emerald-200",
    fileIconColor: "text-emerald-500",
    fileHoverBg: "hover:bg-emerald-100",
    uploadIcon: (
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
    readyBadge: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", label: "Ready" },
    importedBadge: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Imported" },
    btnClass: "bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-700",
    uploadLabel: "Upload Projects CSV",
  },
} as const;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadZone({ type, onUpload }: UploadZoneProps) {
  const cfg = config[type];
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<ZoneState>("idle");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function selectFile(f: File) {
    if (!f.name.endsWith(".csv")) return;
    setFile(f);
    setState("selected");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) selectFile(f);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) selectFile(f);
    e.target.value = "";
  }

  function clearFile() {
    setFile(null);
    setState("idle");
  }

  async function handleUpload() {
    if (!file) return;
    setState("uploading");
    setErrorMsg(null);
    try {
      const res = await onUpload(file);
      setResult(res);
      setState("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setState("error");
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setErrorMsg(null);
    setState("idle");
  }

  const badge = state === "success" ? cfg.importedBadge : cfg.readyBadge;

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-x-4 px-6 py-5 border-b border-slate-100">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.accentBg} shadow-md ${cfg.accentShadow}`}>
          {cfg.uploadIcon}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{cfg.label}</p>
          <p className="text-xs text-slate-400">{cfg.description}</p>
        </div>
        <span className={`ml-auto inline-flex items-center gap-x-1.5 rounded-full ${badge.bg} px-2.5 py-1 text-[11px] font-bold ${badge.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
          {badge.label}
        </span>
      </div>

      {/* Body */}
      {state === "success" && result ? (
        <div className="p-6 space-y-5">
          {/* Success header */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
            <div className="flex items-center gap-x-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-black text-emerald-800">Import Successful</p>
                <p className="text-xs font-semibold text-emerald-600 mt-0.5">{file?.name}</p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-2xl font-black text-slate-900">{result.inserted}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Rows Inserted</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-2xl font-black text-blue-600">{result.updated}</p>
              <p className="text-xs font-semibold text-blue-500 mt-0.5">Rows Updated</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-2xl font-black text-amber-600">{result.skipped}</p>
              <p className="text-xs font-semibold text-amber-500 mt-0.5">Rows Skipped</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-2xl font-black text-emerald-600">{result.errors.length}</p>
              <p className="text-xs font-semibold text-emerald-500 mt-0.5">Errors</p>
            </div>
          </div>

          {/* Error log */}
          {result.errors.length > 0 && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-red-400 mb-2">Errors</p>
              <ul className="space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i} className="flex items-start gap-x-2 text-xs text-red-700">
                    <span className="mt-0.5 h-3.5 w-3.5 shrink-0 flex items-center justify-center rounded-full bg-red-100">
                      <svg className="h-2 w-2 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Upload another */}
          <button
            onClick={reset}
            className="flex w-full items-center justify-center gap-x-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload Another File
          </button>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          {/* Drop zone */}
          <div
            className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${dragging ? `${cfg.dropBorderActive} ${cfg.dropBgActive}` : `${cfg.dropBorder} ${cfg.dropBg}`}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <svg className="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <p className="text-sm font-bold text-slate-700">Drop your CSV file here</p>
              <p className="text-xs text-slate-500 mt-1">
                or{" "}
                <button
                  type="button"
                  className="text-indigo-600 font-semibold hover:underline"
                  onClick={() => inputRef.current?.click()}
                >
                  browse to upload
                </button>
              </p>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">Accepts .csv files · Max 10MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>

          {/* Selected file chip */}
          {state === "selected" && file && (
            <div className={`flex items-center gap-x-3 rounded-xl border px-4 py-3 ${cfg.fileBg}`}>
              <svg className={`h-5 w-5 shrink-0 ${cfg.fileIconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className={`flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 ${cfg.fileHoverBg} hover:text-slate-600 transition-colors`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Error message */}
          {state === "error" && errorMsg && (
            <div className="flex items-center gap-x-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-xs font-semibold text-red-700">{errorMsg}</p>
            </div>
          )}

          {/* Upload button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={state !== "selected"}
            className={`flex w-full items-center justify-center gap-x-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${cfg.btnClass}`}
          >
            {state === "uploading" ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {cfg.uploadLabel}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
