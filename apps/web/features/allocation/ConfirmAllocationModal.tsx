import { useState } from "react";
import type { RecommendationItem, Project } from "@/types";

export interface ModalState {
  item: RecommendationItem;
  project: Project;
}

interface ConfirmAllocationModalProps {
  state: ModalState | null;
  onClose: () => void;
  onConfirm: (engineerId: string, percentage: number) => Promise<void>;
  confirming: boolean;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function ConfirmAllocationModal({
  state,
  onClose,
  onConfirm,
  confirming,
}: ConfirmAllocationModalProps) {
  const [percentage, setPercentage] = useState(80);

  if (!state) return null;

  const { item, project } = state;

  function step(delta: number) {
    setPercentage((prev) => Math.min(100, Math.max(10, prev + delta)));
  }

  async function handleConfirm() {
    await onConfirm(item.engineer_id, percentage);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header strip */}
        <div
          className="px-6 pt-6 pb-5"
          style={{ background: "linear-gradient(135deg,#4f46e5 0%,#6366f1 100%)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Allocation</h3>
                <p className="text-xs text-indigo-200 mt-0.5">Review and confirm the resource assignment</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Engineer row */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Engineer</p>
            <div className="flex items-center gap-x-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-400 to-indigo-600 text-sm font-black text-white shadow-md shadow-indigo-500/20">
                {initials(item.engineer_name)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{item.engineer_name}</p>
                <p className="text-xs text-slate-500">{Math.round(item.availability_percentage)}% available</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                Available
              </span>
            </div>
          </div>

          {/* Project row */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Project</p>
            <div className="flex items-center gap-x-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{project.name}</p>
                {project.description && (
                  <p className="text-xs text-slate-500 truncate">{project.description}</p>
                )}
              </div>
              <span className="inline-flex items-center gap-x-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
          </div>

          {/* Allocation % input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Allocation %
            </label>
            <div className="flex items-center gap-x-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={percentage}
                  min={10}
                  max={100}
                  step={10}
                  onChange={(e) =>
                    setPercentage(Math.min(100, Math.max(10, Number(e.target.value))))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-base font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
              </div>
              <div className="flex gap-x-1">
                <button
                  onClick={() => step(-10)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <button
                  onClick={() => step(10)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Preview bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>Allocation preview</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-400 transition-all duration-200"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-x-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex flex-1 items-center justify-center gap-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {confirming ? "Confirming..." : "Confirm Allocation"}
          </button>
        </div>
      </div>
    </div>
  );
}
