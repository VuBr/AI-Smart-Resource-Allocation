import type { RecommendationItem } from "@/types";

interface RecommendationCardProps {
  item: RecommendationItem;
  rank: number;
  onConfirm: (item: RecommendationItem) => void;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const avatarGradients = [
  "from-indigo-400 to-indigo-600",
  "from-emerald-400 to-emerald-600",
  "from-orange-400 to-orange-500",
];

interface ScoreBarProps {
  label: string;
  value: number;
  isBest: boolean;
  isWeak?: boolean;
}

function ScoreBar({ label, value, isBest, isWeak }: ScoreBarProps) {
  const barClass = isWeak
    ? "bg-red-300"
    : isBest
    ? "bg-linear-to-r from-indigo-500 to-indigo-400"
    : "bg-slate-400";

  const valueClass = isWeak ? "text-red-400" : isBest ? "text-indigo-600" : "text-slate-500";

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className={`text-xs font-bold ${valueClass}`}>{value.toFixed(2)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100">
        <div className={`h-1.5 rounded-full ${barClass}`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

function WarningBanner({ text, variant }: { text: string; variant: "amber" | "red" }) {
  const cfg =
    variant === "amber"
      ? { bg: "bg-amber-50 border-amber-200", icon: "text-amber-500", text: "text-amber-700" }
      : { bg: "bg-red-50 border-red-200", icon: "text-red-500", text: "text-red-700" };

  return (
    <div className={`flex items-start gap-x-2 rounded-lg border px-3 py-2 ${cfg.bg}`}>
      <svg className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${cfg.icon}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <p className={`text-[11px] font-medium ${cfg.text}`}>{text}</p>
    </div>
  );
}

export function RecommendationCard({ item, rank, onConfirm }: RecommendationCardProps) {
  const isBest = rank === 0;
  const isWeak = item.score < 0.75;
  const hasLevelMismatch = item.experience_match < 0.6;

  const cardClass = isBest
    ? "relative rounded-2xl border-2 border-indigo-500 bg-white shadow-md shadow-indigo-500/10 overflow-hidden flex flex-col"
    : "rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col";

  const scoreClass = isBest
    ? "text-3xl font-black text-indigo-600"
    : isWeak
    ? "text-3xl font-black text-slate-400"
    : "text-3xl font-black text-slate-700";

  const confirmBtnClass = isBest
    ? "flex w-full items-center justify-center gap-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-700 transition-colors"
    : isWeak
    ? "flex w-full items-center justify-center gap-x-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
    : "flex w-full items-center justify-center gap-x-2 rounded-xl border-2 border-indigo-500 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors";

  return (
    <div className={cardClass}>
      {isBest && (
        <div className="absolute top-3 right-3 z-10">
          <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[10px] font-black text-white shadow-sm tracking-wide uppercase">
            Best Match
          </span>
        </div>
      )}

      <div className="p-5 flex-1 space-y-4">
        {/* Engineer info */}
        <div className="flex items-center gap-x-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${avatarGradients[rank % 3]} text-sm font-black text-white shadow-md`}>
            {initials(item.engineer_name)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{item.engineer_name}</p>
            <p className="text-xs text-slate-500">
              {Math.round(item.availability_percentage)}% available
            </p>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-baseline gap-x-2">
          <span className={scoreClass}>{item.score.toFixed(2)}</span>
          <span className="text-xs font-semibold text-slate-400">match score</span>
        </div>

        {/* Score bars */}
        <div className="space-y-3">
          <ScoreBar label="Skill Match" value={item.skill_match} isBest={isBest} />
          <ScoreBar
            label="Level Match"
            value={item.experience_match}
            isBest={isBest}
            isWeak={hasLevelMismatch}
          />
          <ScoreBar label="Availability" value={item.availability_match} isBest={isBest} />
        </div>

        {/* Warning banners */}
        {hasLevelMismatch && (
          <WarningBanner text="Level mismatch — check requirements" variant="red" />
        )}
        {!hasLevelMismatch && item.availability_percentage < 30 && (
          <WarningBanner text="Low availability — confirm early" variant="amber" />
        )}
      </div>

      {/* Confirm button */}
      <div className="px-5 pb-5">
        <button onClick={() => onConfirm(item)} className={confirmBtnClass}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Confirm Allocation
        </button>
      </div>
    </div>
  );
}
