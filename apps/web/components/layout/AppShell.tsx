import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-100 font-sans antialiased" style={{ minWidth: 1280 }}>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16">{children}</main>
    </div>
  );
}
