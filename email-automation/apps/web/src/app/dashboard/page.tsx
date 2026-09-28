import { Mail, Users, CreditCard, TrendingUp } from "lucide-react";
import Link from "next/link";

const STATS = [
  { label: "Credits remaining", value: "7",  icon: CreditCard, note: "Buy more" },
  { label: "Emails sent",       value: "2",  icon: Mail,        note: "Last 30 days" },
  { label: "Contacts unlocked", value: "0",  icon: Users,       note: "From directory" },
  { label: "Reply rate",        value: "—",  icon: TrendingUp,  note: "Coming soon" },
];

const RECENT = [
  { company: "Google",    to: "s●●●@google.com",    subject: "Application for FDE at Google",    status: "Sent",   date: "Sep 27" },
  { company: "Stripe",    to: "r●●●@stripe.com",    subject: "Application for SWE at Stripe",    status: "Sent",   date: "Sep 26" },
  { company: "Anthropic", to: "c●●●@anthropic.com", subject: "Application for FDE at Anthropic", status: "Failed", date: "Sep 25" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-neutral-400 text-sm mt-1">Welcome back, Anirudh</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon, note }) => (
          <div key={label} className="border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-500">{label}</p>
              <Icon size={14} className="text-neutral-600" />
            </div>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-neutral-600">{note}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link href="/send"
          className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition">
          Send emails
        </Link>
        <Link href="/directory"
          className="border border-neutral-700 px-4 py-2 rounded-lg text-sm hover:border-neutral-500 transition">
          Browse directory
        </Link>
        <Link href="/credits"
          className="border border-neutral-700 px-4 py-2 rounded-lg text-sm hover:border-neutral-500 transition">
          Buy credits
        </Link>
      </div>

      {/* Recent sends */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Recent sends</h2>
        <div className="border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/50">
                <th className="text-left px-4 py-3 text-xs text-neutral-500 font-medium">Company</th>
                <th className="text-left px-4 py-3 text-xs text-neutral-500 font-medium">Subject</th>
                <th className="text-left px-4 py-3 text-xs text-neutral-500 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-xs text-neutral-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT.map((row, i) => (
                <tr key={i} className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-900/30 transition">
                  <td className="px-4 py-3 font-medium">{row.company}</td>
                  <td className="px-4 py-3 text-neutral-400 max-w-xs truncate">{row.subject}</td>
                  <td className="px-4 py-3 text-neutral-500">{row.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      row.status === "Sent"
                        ? "bg-green-950 text-green-400 border border-green-900"
                        : "bg-red-950 text-red-400 border border-red-900"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
