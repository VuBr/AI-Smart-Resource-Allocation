import { useState } from "react";
import type { CreateProjectRequest, EngineerLevel, ProjectStatus } from "@/types";

interface AddProjectModalProps {
  open: boolean;
  creating: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateProjectRequest) => Promise<void>;
}

const levels: EngineerLevel[] = ["junior", "mid", "senior", "lead"];
const statuses: ProjectStatus[] = ["planned", "active", "closed"];

const defaultForm: CreateProjectRequest = {
  name: "",
  description: "",
  required_skills: "",
  required_level: "mid",
  headcount: 1,
  status: "planned",
  start_date: null,
  end_date: null,
};

export function AddProjectModal({
  open,
  creating,
  submitError,
  onClose,
  onSubmit,
}: AddProjectModalProps) {
  const [form, setForm] = useState<CreateProjectRequest>(defaultForm);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit() {
    if (!form.name?.trim()) {
      setError("Project name is required.");
      return;
    }
    if ((form.headcount ?? 0) <= 0) {
      setError("Headcount must be greater than 0.");
      return;
    }
    setError(null);
    await onSubmit({
      ...form,
      description: form.description?.trim() ? form.description : null,
      required_skills: form.required_skills?.trim() ? form.required_skills : null,
      start_date: form.start_date?.trim() ? form.start_date : null,
      end_date: form.end_date?.trim() ? form.end_date : null,
    });
    setForm(defaultForm);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-linear-to-r from-indigo-600 to-indigo-500 px-6 pb-5 pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-white">New Project</h3>
              <p className="mt-0.5 text-xs text-indigo-100">Create a new project profile</p>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {(error || submitError) && (
          <div className="px-6 py-2flex items-start  rounded-2xl border border-red-200 bg-red-50  py-4 ml-5 mr-5 mt-5">
            <p className="px-6 pb-2 text-sm font-medium text-red-600">{error || submitError}</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Project Name *</span>
            <input required className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Platform Revamp" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Required Level</span>
            <select className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm capitalize" value={form.required_level ?? ""} onChange={(e) => setForm((p) => ({ ...p, required_level: e.target.value as EngineerLevel }))}>
              {levels.map((level) => (
                <option key={level} value={level} className="capitalize">{level}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs font-semibold text-slate-600">Description</span>
            <input className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Modernize legacy dashboard and APIs" value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Required Skills</span>
            <input className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="React, Node.js" value={form.required_skills ?? ""} onChange={(e) => setForm((p) => ({ ...p, required_skills: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Headcount *</span>
            <input type="number" min={1} required className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="3" value={form.headcount ?? 1} onChange={(e) => setForm((p) => ({ ...p, headcount: Number(e.target.value) }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Status</span>
            <select className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm capitalize" value={form.status ?? "planned"} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ProjectStatus }))}>
              {statuses.map((status) => (
                <option key={status} value={status} className="capitalize">{status}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Start Date</span>
            <input type="date" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={form.start_date ?? ""} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs font-semibold text-slate-600">End Date</span>
            <input type="date" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={form.end_date ?? ""} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} />
          </label>
        </div>
        <div className="flex items-center gap-x-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={creating} className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {creating ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
