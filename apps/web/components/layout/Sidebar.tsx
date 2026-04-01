"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/engineers", label: "Engineers" },
  { href: "/upload", label: "Upload Data" },
  { href: "/projects", label: "Projects" },
  { href: "/allocation", label: "Allocation" },
  { href: "/bench-forecast", label: "Bench Forecast" },
  { href: "/reports", label: "Reports" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col py-6">
      <div className="px-4 mb-8">
        <h1 className="text-lg font-bold">AI Resource</h1>
        <p className="text-xs text-gray-400">Allocation System</p>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-3 py-2 rounded text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
