"use client";

import type { ReactNode } from "react";
import type { BreadcrumbItem } from "./AppShell";

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  headerSlot?: ReactNode;
}

const defaultBreadcrumbs: BreadcrumbItem[] = [{ label: "ResourceAI" }, { label: "Dashboard", active: true }];

export function Header({ breadcrumbs = defaultBreadcrumbs, title = "Overview", headerSlot }: HeaderProps) {
  return (
    <header className="fixed left-64 right-0 top-0 z-10 flex h-16 items-center border-b border-slate-200/80 bg-white/95 backdrop-blur-sm px-6 gap-x-4">
      {/* Breadcrumb + title */}
      <div className="flex-1">
        <div className="flex items-center gap-x-2 text-xs text-slate-400 font-medium">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-x-2">
              {i > 0 && <span className="text-slate-300">/</span>}
              <span className={crumb.active ? "text-slate-500" : i === breadcrumbs.length - 1 ? "text-slate-700 font-semibold" : ""}>
                {crumb.label}
              </span>
            </span>
          ))}
        </div>
        <h1 className="text-sm font-bold text-slate-900 mt-0.5 leading-none">{title}</h1>
      </div>

      {/* Page-specific slot (search, buttons, etc.) */}
      {headerSlot}

      {/* Notification bell */}
      <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors">
        <svg style={{ height: 18, width: 18 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
      </button>

      {/* User chip — TODO: Replace with real JWT auth before production */}
      <button className="flex items-center gap-x-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:border-slate-300 transition-colors">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 text-[10px] font-bold text-white">
          JD
        </div>
        <span className="font-medium text-slate-700">John Doe</span>
        <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">Admin</span>
        <svg className="h-3.5 w-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    </header>
  );
}
