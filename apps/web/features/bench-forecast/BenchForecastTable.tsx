"use client";

import { useState } from "react";
import type { BenchForecastItem, RiskLevel } from "@/types";

interface BenchForecastTableProps {
  items: BenchForecastItem[];
}

type TabValue = "all" | RiskLevel;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function initials(name: string) {
  return (name ?? "").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const riskConfig = {
  high: {
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
    bar: "bg-red-500",
    value: "text-red-600",
    rowBg: "bg-red-50/20 hover:bg-red-50/40",
    label: "High",
  },
  medium: {
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    bar: "bg-amber-400",
    value: "text-amber-600",
    rowBg: "hover:bg-slate-50/50",
    label: "Medium",
  },
  low: {
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    value: "text-emerald-600",
    rowBg: "hover:bg-slate-50/50",
    label: "Low",
  },
} as const;

const tabConfig: { value: TabValue; label: string; activeClass: string }[] = [
  { value: "all", label: "All", activeClass: "bg-slate-900 text-white shadow-sm" },
  { value: "high", label: "High Risk", activeClass: "bg-red-600 text-white shadow-sm" },
  { value: "medium", label: "Medium", activeClass: "bg-amber-500 text-white shadow-sm" },
  { value: "low", label: "Low", activeClass: "bg-emerald-600 text-white shadow-sm" },
];

const AI_ACCURACY = 89.2;

export function BenchForecastTable({ items }: BenchForecastTableProps) {
  const [tab, setTab] = useState<TabValue>("all");

  const filtered = tab === "all" ? items : items.filter((i) => i.risk_level === tab);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="rounded-xl border border-slate-200 bg-white p-1 w-fit shadow-sm flex items-center gap-x-0.5">
        {tabConfig.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
              tab === t.value ? t.activeClass : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Bench Forecast</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              AI-predicted bench risk sorted by urgency
            </p>
          </div>
          <div className="flex items-center gap-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
            <svg className="h-3.5 w-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            AI Model accuracy:{" "}
            <span className="font-bold text-slate-700 ml-0.5">{AI_ACCURACY}%</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Engineer</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Forecast Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Risk</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Probability</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Days Until Bench</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                    No forecast data.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const cfg = riskConfig[item.risk_level] ?? riskConfig.low;
                  const pct = Math.round(item.probability * 100);
                  return (
                    <tr key={item.engineer_id} className={`transition-colors ${cfg.rowBg}`}>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-x-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cfg.badge} text-xs font-bold`}>
                            {initials(item.engineer_name)}
                          </div>
                          <p className="text-sm font-semibold text-slate-900">{item.engineer_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                        {formatDate(item.forecast_date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${cfg.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-x-2">
                          <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                            <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${cfg.value}`}>{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">
                        {item.days_until_bench !== null
                          ? `${item.days_until_bench} day${item.days_until_bench !== 1 ? "s" : ""}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{filtered.length}</span> engineers
            {tab !== "all" && (
              <> · filtered by <span className="font-semibold text-slate-700 capitalize">{tab}</span> risk</>
            )}
            {" · "}AI Model accuracy:{" "}
            <span className="font-semibold text-slate-700">{AI_ACCURACY}%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
