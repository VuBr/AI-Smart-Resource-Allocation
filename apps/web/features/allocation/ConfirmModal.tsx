import type { AllocationDetail } from "@/types";

export interface ConfirmModalState {
  mode: "edit" | "remove";
  allocation: AllocationDetail;
}

interface ConfirmModalProps {
  state: ConfirmModalState | null;
  busy: boolean;
  percentage: number;
  onPercentageChange: (value: number) => void;
  onClose: () => void;
  onConfirm: (allocation: AllocationDetail, percentage?: number) => Promise<void>;
}

function initials(name: string) {
  return (name ?? "").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function ConfirmModal({
  state,
  busy,
  percentage,
  onPercentageChange,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  if (!state) return null;

  const { mode, allocation } = state;
  const isEdit = mode === "edit";

  async function handleConfirm() {
    await onConfirm(allocation, isEdit ? percentage : undefined);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div
          className="px-6 pb-5 pt-6"
          style={{
            background: isEdit
              ? "linear-gradient(135deg,#4f46e5 0%,#6366f1 100%)"
              : "linear-gradient(135deg,#dc2626 0%,#ef4444 100%)",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-white">{isEdit ? "Edit Allocation" : "Remove Allocation"}</h3>
              <p className="mt-0.5 text-xs text-white/80">
                {isEdit ? "Update allocation percentage" : "This action cannot be undone"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Engineer</p>
            <div className="flex items-center gap-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-400 to-indigo-600 text-sm font-black text-white">
                {initials(allocation.engineer_name)}
              </div>
              <p className="text-sm font-bold text-slate-900">{allocation.engineer_name}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Project</p>
            <p className="text-sm font-bold text-slate-900">{allocation.project_name}</p>
          </div>

          {isEdit ? (
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Allocation %
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={percentage}
                  onChange={(e) => onPercentageChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-base font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Remove allocation for <span className="font-semibold text-slate-900">{allocation.engineer_name}</span> from{" "}
              <span className="font-semibold text-slate-900">{allocation.project_name}</span>?
            </p>
          )}
        </div>

        <div className="flex items-center gap-x-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy || (isEdit && (percentage < 1 || percentage > 100 || Number.isNaN(percentage)))}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
              isEdit ? "bg-indigo-600 hover:bg-indigo-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {busy ? "Processing..." : isEdit ? "Save Changes" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}
