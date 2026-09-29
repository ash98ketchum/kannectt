import { Mail, Users, CreditCard, TrendingUp } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

async function getDashboardData() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Run queries in parallel
  const [profileRes, sendsRes, unlocksRes] = await Promise.all([
    supabase.from("users").select("credits_balance").eq("id", user.id).single(),
    supabase.from("email_sends").select("id, company, to_email, subject, status, sent_at")
      .eq("user_id", user.id)
      .order("sent_at", { ascending: false })
      .limit(10),
    supabase.from("user_unlocks").select("contact_id").eq("user_id", user.id),
  ]);

  const sentCount = (sendsRes.data ?? []).filter(r => r.status === "sent").length;

  return {
    email: user.email ?? "",
    credits: profileRes.data?.credits_balance ?? 0,
    emailsSent: sentCount,
    unlocksCount: unlocksRes.data?.length ?? 0,
    recent: sendsRes.data ?? [],
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="text-neutral-500 text-sm py-10 text-center">
        Unable to load dashboard data.
      </div>
    );
  }

  const firstName = data.email.split("@")[0].split(".")[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const stats = [
    { label: "Credits remaining", value: String(data.credits),     icon: CreditCard, note: "Buy more"        },
    { label: "Emails sent",       value: String(data.emailsSent),  icon: Mail,        note: "All time"       },
    { label: "Contacts unlocked", value: String(data.unlocksCount),icon: Users,       note: "From directory" },
    { label: "Reply rate",        value: "—",                       icon: TrendingUp,  note: "Coming soon"    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-neutral-400 text-sm mt-1">Welcome back, {displayName}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, note }) => (
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
          {data.recent.length === 0 ? (
            <p className="px-4 py-8 text-sm text-neutral-600 text-center">
              No emails sent yet.{" "}
              <Link href="/send" className="underline text-neutral-400">Send your first one →</Link>
            </p>
          ) : (
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
                {data.recent.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-900/30 transition">
                    <td className="px-4 py-3 font-medium">{row.company ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-400 max-w-xs truncate">{row.subject ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(row.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        row.status === "sent"
                          ? "bg-green-950 text-green-400 border border-green-900"
                          : "bg-red-950 text-red-400 border border-red-900"
                      }`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
