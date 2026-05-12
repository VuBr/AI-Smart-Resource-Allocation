import { useState } from "react";
import type { CreateEngineerRequest, EngineerLevel } from "@/types";

interface AddEngineerModalProps {
  open: boolean;
  creating: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateEngineerRequest) => Promise<void>;
}

const defaultForm: CreateEngineerRequest = {
  name: "",
  email: "",
  primary_skill: "",
  secondary_skills: "",
  level: "mid",
  years_of_experience: 0,
  availability_percentage: 100,
  bench_start_date: null,
};

const levels: EngineerLevel[] = ["junior", "mid", "senior", "lead"];

export function AddEngineerModal({
  open,
  creating,
  submitError,
  onClose,
  onSubmit,
}: AddEngineerModalProps) {
  const [form, setForm] = useState<CreateEngineerRequest>(defaultForm);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit() {
    if (!form.name || !form.email || !form.primary_skill) {
      setError("Name, email, and primary skill are required.");
      return;
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Email is not valid.");
      return;
    }
    if ((form.availability_percentage ?? 0) < 0 || (form.availability_percentage ?? 0) > 100) {
      setError("Availability must be between 0 and 100.");
      return;
    }
    setError(null);
    await onSubmit({
      ...form,
      secondary_skills: form.secondary_skills?.trim() ? form.secondary_skills : null,
      bench_start_date: form.bench_start_date?.trim() ? form.bench_start_date : null,
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
              <h3 className="text-base font-bold text-white">Add Engineer</h3>
              <p className="mt-0.5 text-xs text-indigo-100">Create a new engineer profile</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
            >
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
            <span className="text-xs font-semibold text-slate-600">Name *</span>
            <input required className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Nguyen Van A" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Email *</span>
            <input required type="email" pattern="^[^@\s]+@[^@\s]+\.[^@\s]+$" title="Please enter a valid email address" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="engineer@company.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Primary Skill *</span>
            <input required className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Java" value={form.primary_skill} onChange={(e) => setForm((p) => ({ ...p, primary_skill: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Level *</span>
            <select required className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm capitalize" value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value as EngineerLevel }))}>
              {levels.map((level) => (
                <option key={level} value={level} className="capitalize">{level}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs font-semibold text-slate-600">Secondary Skills</span>
            <input className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="React, Node.js" value={form.secondary_skills ?? ""} onChange={(e) => setForm((p) => ({ ...p, secondary_skills: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Years of Experience</span>
            <input type="number" min={0} required className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="5" value={form.years_of_experience ?? 0} onChange={(e) => setForm((p) => ({ ...p, years_of_experience: Number(e.target.value) }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Availability %</span>
            <input type="number" min={0} max={100} required className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="80" value={form.availability_percentage ?? 100} onChange={(e) => setForm((p) => ({ ...p, availability_percentage: Number(e.target.value) }))} />
          </label>
          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs font-semibold text-slate-600">Bench Start Date</span>
            <input type="date" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={form.bench_start_date ?? ""} onChange={(e) => setForm((p) => ({ ...p, bench_start_date: e.target.value }))} />
          </label>
        </div>

        

        <div className="flex items-center gap-x-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={creating} className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {creating ? "Creating..." : "Create Engineer"}
          </button>
        </div>
      </div>
    </div>
  );
}
