import Link from "next/link";
import type { BenchAlertItem } from "@/types";

interface BenchAlertsTableProps {
  alerts: BenchAlertItem[];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const avatarColors: Record<number, string> = {
  0: "bg-red-100 text-red-700",
  1: "bg-orange-100 text-orange-700",
  2: "bg-teal-100 text-teal-700",
  3: "bg-indigo-100 text-indigo-700",
  4: "bg-violet-100 text-violet-700",
};

function riskBadge(risk: BenchAlertItem["risk_level"]) {
  if (risk === "high")
    return (
      <span className="inline-flex items-center gap-x-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        High
      </span>
    );
  if (risk === "medium")
    return (
      <span className="inline-flex items-center gap-x-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Medium
      </span>
    );
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Low
    </span>
  );
}

function daysBadge(days: number) {
  if (days === 0)
    return (
      <span className="inline-flex items-center gap-x-1 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        0 days
      </span>
    );
  if (days <= 14)
    return <span className="text-sm font-bold text-red-600 tabular-nums">{days} days</span>;
  return <span className="text-sm font-bold text-amber-600 tabular-nums">{days} days</span>;
}

function benchStartLabel(days: number, date: string) {
  if (days <= 0) return "On Bench Now";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const rowHover: Record<BenchAlertItem["risk_level"], string> = {
  high: "hover:bg-red-50/30",
  medium: "hover:bg-amber-50/30",
  low: "hover:bg-slate-50/30",
};

export function BenchAlertsTable({ alerts }: BenchAlertsTableProps) {
  return (
    <div className="col-span-2 overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
            <svg className="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Bench Alerts</h3>
            <p className="text-xs text-slate-400">Engineers predicted to bench within 30 days</p>
          </div>
        </div>
        <div className="flex items-center gap-x-3">
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
            {alerts.length} at risk
          </span>
          <Link href="/bench-forecast" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
            View all →
          </Link>
        </div>
      </div>

      <table className="min-w-full">
        <thead>
          <tr className="bg-slate-50/70">
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Engineer</th>
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Bench Start</th>
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Days Until Bench</th>
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Risk Level</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {alerts.map((alert, i) => (
            <tr key={alert.engineer_id} className={`${rowHover[alert.risk_level]} transition-colors`}>
              <td className="px-6 py-3.5">
                <div className="flex items-center gap-x-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${avatarColors[i % 5]} text-[11px] font-bold`}>
                    {initials(alert.engineer_name)}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{alert.engineer_name}</span>
                </div>
              </td>
              <td className="px-6 py-3.5 text-sm text-slate-500">
                {benchStartLabel(alert.days_until_bench, alert.bench_start_date)}
              </td>
              <td className="px-6 py-3.5">{daysBadge(alert.days_until_bench)}</td>
              <td className="px-6 py-3.5">{riskBadge(alert.risk_level)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
