"use client";

import { CheckCircle2 } from "lucide-react";

const BRAND_GRADIENT = "linear-gradient(145deg,#1e1b4b 0%,#312e81 40%,#4338ca 100%)";
const TEXT_GRADIENT = "linear-gradient(135deg,#a5b4fc,#c084fc)";
const GRID_OVERLAY = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
  backgroundSize: "40px 40px",
};

const STATS = [
  { value: "89%", label: "Forecast accuracy" },
  { value: "3×", label: "Faster allocation" },
  { value: "-40%", label: "Bench time reduced" },
];

const FEATURES = [
  "AI-driven bench prediction with risk scoring",
  "Smart skill-matching across projects and teams",
  "Real-time shortage reports and workforce analytics",
];

export function BrandPanel() {
  return (
    <div
      className="relative hidden lg:flex lg:w-[55%] flex-col justify-between overflow-hidden p-12"
      style={{ background: BRAND_GRADIENT }}
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={GRID_OVERLAY} />
      </div>

      {/* Logo */}
      <div className="relative flex items-center gap-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-sm">
          <svg
            className="h-6 w-6 text-indigo-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"
            />
          </svg>
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight text-white">ResourceAI</p>
          <p className="text-xs font-medium text-indigo-300/80">Enterprise Platform</p>
        </div>
      </div>

      {/* Hero */}
      <div className="relative">
        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-x-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1.5 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-300/60" />
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
            AI-Powered Workforce Intelligence
          </span>
        </div>

        {/* Heading */}
        <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white">
          Intelligent Resource
          <br />
          <span className="bg-clip-text text-transparent" style={{ background: TEXT_GRADIENT }}>
            Allocation at Scale
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-5 max-w-md text-base leading-relaxed text-indigo-200/70">
          Predict bench periods with 89% accuracy, automate engineer matching, and eliminate
          staffing gaps before they become project risks.
        </p>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.value}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm"
            >
              <p className="text-2xl font-bold tabular-nums text-white">{stat.value}</p>
              <p className="mt-1 text-xs leading-tight text-indigo-300/70">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-8 space-y-3">
          {FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-x-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <p className="text-sm text-indigo-200/80">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative">
        <p className="text-xs text-indigo-300/40">
          © 2025 ResourceAI · Enterprise Edition · v2.4.0
        </p>
      </div>
    </div>
  );
}
