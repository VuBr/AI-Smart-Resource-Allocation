interface ColumnRow {
  name: string;
  example: string;
  required: boolean;
}

const engineerColumns: ColumnRow[] = [
  { name: "employee_id", example: "e.g. ENG-0001", required: true },
  { name: "full_name", example: "e.g. Linh Nguyen", required: true },
  { name: "email", example: "e.g. linh@company.io", required: true },
  { name: "level", example: "junior / mid / senior / lead", required: true },
  { name: "skills", example: "semicolon-separated", required: true },
  { name: "department", example: "e.g. AI & Data Science", required: true },
  { name: "manager", example: "manager name", required: false },
  { name: "joined_date", example: "YYYY-MM-DD", required: false },
  { name: "location", example: "city, country", required: false },
];

const projectColumns: ColumnRow[] = [
  { name: "project_id", example: "e.g. PRJ-0015", required: true },
  { name: "project_name", example: "e.g. Project Helios", required: true },
  { name: "status", example: "active / completed / on_hold", required: true },
  { name: "start_date", example: "YYYY-MM-DD", required: true },
  { name: "end_date", example: "YYYY-MM-DD", required: true },
  { name: "required_skills", example: "semicolon-separated", required: true },
  { name: "required_level", example: "junior / mid / senior / lead", required: false },
  { name: "client", example: 'client or "Internal"', required: false },
  { name: "allocation_slots", example: "number e.g. 3", required: false },
];

function ColumnTable({ columns }: { columns: ColumnRow[] }) {
  return (
    <div className="space-y-2.5">
      {columns.map((col, i) => (
        <div
          key={col.name}
          className={`flex items-center justify-between py-2 ${i < columns.length - 1 ? "border-b border-slate-50" : ""}`}
        >
          <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-mono font-semibold text-slate-700">
            {col.name}
          </code>
          <div className="flex items-center gap-x-2">
            <span className="text-xs text-slate-400">{col.example}</span>
            {col.required ? (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                required
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                optional
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CsvColumnReference() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-x-3 px-6 py-5 border-b border-slate-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
          <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-slate-900">CSV Column Reference</h3>
        <span className="text-xs text-slate-400">Use these exact column headers in your CSV files</span>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 p-6">
        {/* Engineers */}
        <div className="pr-8">
          <div className="flex items-center gap-x-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
              <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-800">Engineers CSV Columns</p>
          </div>
          <ColumnTable columns={engineerColumns} />
        </div>

        {/* Projects */}
        <div className="pl-8">
          <div className="flex items-center gap-x-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
              <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-800">Projects CSV Columns</p>
          </div>
          <ColumnTable columns={projectColumns} />
        </div>
      </div>
    </div>
  );
}
