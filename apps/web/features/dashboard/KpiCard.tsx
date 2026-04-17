import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  trend: string;
  trendLabel: string;
  trendUp: boolean;
  barWidth: string;
  barColor: string;
  iconBg: string;
  iconShadow: string;
  icon: ReactNode;
}

export function KpiCard({
  label,
  value,
  trend,
  trendLabel,
  trendUp,
  barWidth,
  barColor,
  iconBg,
  iconShadow,
  icon,
}: KpiCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent before:pointer-events-none before:rounded-[inherit]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-2 text-4xl font-black text-slate-900 tabular-nums leading-none">{value}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconShadow}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-x-1.5 mb-3">
        <span className={`inline-flex items-center gap-x-1 text-xs font-bold ${trendUp ? "text-emerald-600" : "text-red-600"}`}>
          {trendUp ? (
            <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          ) : (
            <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          )}
          {trend}
        </span>
        <span className="text-xs text-slate-400">{trendLabel}</span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: barWidth }} />
      </div>
    </div>
  );
}
