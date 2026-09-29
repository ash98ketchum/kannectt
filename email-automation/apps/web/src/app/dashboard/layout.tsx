import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ambient-bg flex min-h-screen bg-[#0A0905]">
      <Sidebar />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-4xl mx-auto px-10 py-10">{children}</div>
      </main>
    </div>
  );
}
