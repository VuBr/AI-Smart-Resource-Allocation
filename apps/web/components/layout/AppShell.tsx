import type { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface AppShellProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  headerSlot?: ReactNode;
}

export function AppShell({ children, breadcrumbs, title, headerSlot }: AppShellProps) {
  return (
    <div className="bg-slate-100 font-sans antialiased" style={{ minWidth: 1280 }}>
      <Sidebar />
      <Header breadcrumbs={breadcrumbs} title={title} headerSlot={headerSlot} />
      <main className="ml-64 pt-16">{children}</main>
    </div>
  );
}
