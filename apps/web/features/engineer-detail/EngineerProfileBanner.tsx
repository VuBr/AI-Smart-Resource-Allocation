import type { Engineer } from "@/types";

interface EngineerProfileBannerProps {
  engineer: Engineer;
}

function initials(name: string) {
  return (name ?? "").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function parseSkills(engineer: Engineer): string[] {
  const skills: string[] = [engineer.primary_skill];
  if (engineer.secondary_skills) {
    skills.push(...engineer.secondary_skills.split(",").map((s) => s.trim()).filter(Boolean));
  }
  return skills;
}

function availabilityLabel(pct: number) {
  if (pct === 0) return { label: "Fully Allocated", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
  if (pct >= 80) return { label: "Available", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" };
  if (pct >= 30) return { label: `Available (${pct}%)`, bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" };
  return { label: `Available (${pct}%)`, bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" };
}

const levelLabel: Record<string, string> = {
  junior: "Junior Engineer",
  mid: "Mid Engineer",
  senior: "Senior Engineer",
  lead: "Lead Engineer",
};

export function EngineerProfileBanner({ engineer }: EngineerProfileBannerProps) {
  const skills = parseSkills(engineer);
  const avail = availabilityLabel(engineer.availability_percentage);

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-8 py-8" style={{ background: "linear-gradient(135deg,#eef2ff 0%,#e0e7ff 100%)" }}>
        <div className="flex items-start gap-x-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-linear-to-br from-indigo-400 to-indigo-600 text-2xl font-black text-white shadow-lg shadow-indigo-500/30">
              {initials(engineer.name)}
            </div>
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>

          {/* Name & meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-x-3 flex-wrap">
              <h2 className="text-2xl font-black text-slate-900">{engineer.name}</h2>
              <span className="text-sm font-semibold text-slate-500">
                {levelLabel[engineer.level] ?? engineer.level}
              </span>
              <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${avail.bg} ${avail.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${avail.dot}`} />
                {avail.label}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-x-5 text-sm text-slate-500 flex-wrap">
              <span className="flex items-center gap-x-1.5">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                {engineer.email}
              </span>
              <span className="flex items-center gap-x-1.5">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
                {engineer.years_of_experience} years experience
              </span>
            </div>

            {/* Skill chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-indigo-100 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Metadata grid */}
          <div className="shrink-0 grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Level</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700 capitalize">{engineer.level}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Skill</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">{engineer.primary_skill}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Availability</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">{engineer.availability_percentage}%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bench Date</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                {engineer.bench_start_date
                  ? new Date(engineer.bench_start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
