export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-neutral-400 text-sm mt-1">Welcome back</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Credits Remaining", value: "—" },
          { label: "Emails Sent", value: "—" },
          { label: "Contacts Unlocked", value: "—" },
        ].map((s) => (
          <div key={s.label} className="border border-neutral-800 rounded-lg p-4">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-neutral-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <a href="/directory" className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition">
          Browse Directory
        </a>
        <a href="/send" className="px-4 py-2 border border-neutral-700 rounded-lg text-sm hover:border-neutral-500 transition">
          Send Emails
        </a>
        <a href="/credits" className="px-4 py-2 border border-neutral-700 rounded-lg text-sm hover:border-neutral-500 transition">
          Buy Credits
        </a>
      </div>
    </div>
  );
}
