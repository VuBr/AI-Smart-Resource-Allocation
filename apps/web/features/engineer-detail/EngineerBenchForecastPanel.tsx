import type { BenchForecastItem } from "@/types";

interface EngineerBenchForecastPanelProps {
  forecast: BenchForecastItem;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const riskConfig = {
  high: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "High Risk", strip: "bg-red-500", recBg: "bg-red-50 border-red-200", recTitle: "text-red-800", recText: "text-red-700", recIcon: "text-red-600", recIconBg: "bg-red-100" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Medium Risk", strip: "bg-amber-400", recBg: "bg-amber-50 border-amber-200", recTitle: "text-amber-800", recText: "text-amber-700", recIcon: "text-amber-600", recIconBg: "bg-amber-100" },
  low: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Low Risk", strip: "bg-emerald-400", recBg: "bg-emerald-50 border-emerald-200", recTitle: "text-emerald-800", recText: "text-emerald-700", recIcon: "text-emerald-600", recIconBg: "bg-emerald-100" },
} as const;

function recommendationText(forecast: BenchForecastItem): string {
  const pct = Math.round(forecast.probability * 100);
  const days = forecast.days_until_bench;

  if (forecast.risk_level === "high") {
    return `This engineer has a ${pct}% probability of going on bench${days !== null ? ` in ${days} days` : ""}. Immediate action is recommended — assign to an active project as soon as possible to avoid bench time.`;
  }
  if (forecast.risk_level === "medium") {
    return `This engineer has a ${pct}% probability of going on bench${days !== null ? ` in approximately ${days} days` : ""}. Consider pre-allocating to an upcoming project to ensure a seamless transition with no gap between engagements.`;
  }
  return `This engineer has a ${pct}% probability of going on bench. Current risk is low — no immediate action required. Continue monitoring allocation status.`;
}

export function EngineerBenchForecastPanel({ forecast }: EngineerBenchForecastPanelProps) {
  const cfg = riskConfig[forecast.risk_level] ?? riskConfig.low;
  const pct = Math.round(forecast.probability * 100);

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="flex">
        {/* Left accent strip */}
        <div className={`w-1 shrink-0 ${cfg.strip}`} />

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-x-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cfg.recIconBg}`}>
                <svg className={`h-5 w-5 ${cfg.recIcon}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bench Forecast</h3>
                <p className="text-xs text-slate-400">AI-powered prediction</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>

          {/* Stat boxes */}
          <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
            <div className="px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Forecast Date</p>
              <p className="mt-1.5 text-xl font-black text-slate-900">{formatDate(forecast.forecast_date)}</p>
              <p className="mt-0.5 text-xs text-slate-400">Projected bench start</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Probability</p>
              <p className={`mt-1.5 text-xl font-black ${cfg.text}`}>{pct}%</p>
              <p className="mt-0.5 text-xs text-slate-400">Bench likelihood</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Days Until Bench</p>
              <p className="mt-1.5 text-xl font-black text-slate-900">
                {forecast.days_until_bench !== null ? `${forecast.days_until_bench} days` : "—"}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">From today</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alert Status</p>
              <p className="mt-1.5 text-xl font-black text-slate-900">{forecast.is_alert ? "Active" : "None"}</p>
              <p className="mt-0.5 text-xs text-slate-400">{forecast.is_alert ? "Requires attention" : "No alert"}</p>
            </div>
          </div>

          {/* Recommendation box */}
          <div className="p-6">
            <div className={`rounded-xl border p-5 ${cfg.recBg}`}>
              <div className="flex items-start gap-x-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${cfg.recIconBg}`}>
                  <svg className={`h-4 w-4 ${cfg.recIcon}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-bold mb-1.5 ${cfg.recTitle}`}>AI Recommendation</p>
                  <p className={`text-sm leading-relaxed ${cfg.recText}`}>{recommendationText(forecast)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
