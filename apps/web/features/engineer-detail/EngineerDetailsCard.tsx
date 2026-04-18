import type { Engineer, AllocationDetail } from "@/types";

interface EngineerDetailsCardProps {
  engineer: Engineer;
  allocations: AllocationDetail[];
}

function parseSkills(engineer: Engineer): string[] {
  const skills: string[] = [engineer.primary_skill];
  if (engineer.secondary_skills) {
    skills.push(...engineer.secondary_skills.split(",").map((s) => s.trim()).filter(Boolean));
  }
  return skills;
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function AvailabilityRing({ percentage }: { percentage: number }) {
  const circumference = 2 * Math.PI * 15.9;
  const filled = (percentage / 100) * circumference;
  const ringColor = percentage >= 80 ? "#10b981" : percentage >= 30 ? "#f59e0b" : "#6366f1";
  const labelColor = percentage >= 80 ? "text-emerald-600" : percentage >= 30 ? "text-amber-600" : "text-indigo-600";

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-40 w-40 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
        <circle
          cx="18" cy="18" r="15.9"
          fill="none"
          stroke={ringColor}
          strokeWidth="3.5"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black text-slate-900">{percentage}%</span>
        <span className={`text-[11px] font-semibold ${labelColor}`}>Available</span>
      </div>
    </div>
  );
}

export function EngineerDetailsCard({ engineer, allocations }: EngineerDetailsCardProps) {
  const skills = parseSkills(engineer);
  const allocated = 100 - engineer.availability_percentage;

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Engineer Details — col-span-2 */}
      <div className="col-span-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Engineer Details</h3>
        </div>
        <div className="p-6 space-y-6">
          {/* Contact */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Contact Information</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-x-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                  <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-slate-700">{engineer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-x-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                  <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                  <p className="text-sm font-medium text-slate-700">{engineer.years_of_experience} years</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Skills</p>
            <div className="flex flex-wrap gap-2">
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

          {/* Bench date */}
          {engineer.bench_start_date && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Projected Bench Date</p>
              <p className="text-sm font-semibold text-amber-700">{formatDate(engineer.bench_start_date)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Availability Status — col-span-1 */}
      <div className="col-span-1 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Availability Status</h3>
        </div>
        <div className="p-6 flex flex-col items-center">
          <AvailabilityRing percentage={engineer.availability_percentage} />

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {allocated === 0 ? "Fully Available" : allocated === 100 ? "Fully Allocated" : "Partially Allocated"}
          </p>
          <p className="mt-0.5 text-xs text-slate-400 text-center">
            {allocated > 0 ? `${allocated}% allocated across projects` : "No current allocations"}
          </p>

          {/* Bench date card */}
          {engineer.bench_start_date && (
            <div className="mt-5 w-full rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-center gap-x-2 mb-2">
                <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Projected Bench Date</p>
              </div>
              <p className="text-xl font-black text-amber-800">{formatDate(engineer.bench_start_date)}</p>
            </div>
          )}

          {/* Allocation breakdown */}
          {allocations.length > 0 && (
            <div className="mt-4 w-full space-y-2.5">
              {allocations.slice(0, 3).map((a) => (
                <div key={a.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-600 truncate max-w-[140px]">{a.project_name}</span>
                    <span className="font-bold text-indigo-600 shrink-0 ml-2">{a.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${a.percentage}%` }} />
                  </div>
                </div>
              ))}
              {engineer.availability_percentage > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-500">Available capacity</span>
                    <span className="font-bold text-emerald-600">{engineer.availability_percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${engineer.availability_percentage}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
