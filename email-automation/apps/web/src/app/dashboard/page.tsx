"use client";

import { useEffect, useState } from "react";
import { Mail, Users, CreditCard, TrendingUp } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type RecentSend = {
  id: string;
  company: string | null;
  to_email: string;
  subject: string | null;
  status: string;
  sent_at: string;
};

type DashData = {
  email: string;
  credits: number;
  emailsSent: number;
  unlocksCount: number;
  recent: RecentSend[];
};

export default function DashboardPage() {
  const [data, setData]     = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, sendsRes, unlocksRes] = await Promise.all([
        supabase.from("users").select("credits_balance").eq("id", user.id).single(),
        supabase.from("email_sends")
          .select("id, company, to_email, subject, status, sent_at")
          .eq("user_id", user.id)
          .order("sent_at", { ascending: false })
          .limit(10),
        supabase.from("user_unlocks").select("contact_id").eq("user_id", user.id),
      ]);

      const sentCount = (sendsRes.data ?? []).filter((r) => r.status === "sent").length;

      setData({
        email:        user.email ?? "",
        credits:      profileRes.data?.credits_balance ?? 0,
        emailsSent:   sentCount,
        unlocksCount: unlocksRes.data?.length ?? 0,
        recent:       sendsRes.data ?? [],
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-[#1A1915] rounded-lg" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-cream-300/[0.08] rounded-xl p-4 h-28 bg-cream-300/[0.02]" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-cream-300/40 text-sm py-10 text-center">
        Unable to load dashboard data.
      </div>
    );
  }

  const firstName  = data.email.split("@")[0].split(".")[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const stats = [
    { label: "Credits remaining", value: String(data.credits),      icon: CreditCard, note: "Buy more"        },
    { label: "Emails sent",       value: String(data.emailsSent),   icon: Mail,        note: "All time"       },
    { label: "Contacts unlocked", value: String(data.unlocksCount), icon: Users,       note: "From directory" },
    { label: "Reply rate",        value: "—",                        icon: TrendingUp,  note: "Coming soon"    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-cream-300/55 text-sm mt-1">Welcome back, {displayName}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, note }) => (
          <div key={label} className="border border-cream-300/[0.08] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-cream-300/40">{label}</p>
              <Icon size={14} className="text-cream-300/30" />
            </div>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-cream-300/30">{note}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link href="/dashboard/send"
          className="bg-cream-300 text-[#0A0905] px-4 py-2 rounded-lg text-sm font-medium hover:bg-cream-200 transition">
          Send emails
        </Link>
        <Link href="/dashboard/directory"
          className="border border-cream-300/[0.12] px-4 py-2 rounded-lg text-sm hover:border-cream-300/25 transition">
          Browse directory
        </Link>
        <Link href="/dashboard/credits"
          className="border border-cream-300/[0.12] px-4 py-2 rounded-lg text-sm hover:border-cream-300/25 transition">
          Buy credits
        </Link>
      </div>

      {/* Recent sends */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-cream-300/55 uppercase tracking-wider">Recent sends</h2>
        <div className="border border-cream-300/[0.08] rounded-xl overflow-hidden">
          {data.recent.length === 0 ? (
            <p className="px-4 py-8 text-sm text-cream-300/30 text-center">
              No emails sent yet.{" "}
              <Link href="/dashboard/send" className="underline text-cream-300/55">Send your first one →</Link>
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-300/[0.08] bg-cream-300/[0.02]">
                  <th className="text-left px-4 py-3 text-xs text-cream-300/40 font-medium">Company</th>
                  <th className="text-left px-4 py-3 text-xs text-cream-300/40 font-medium">Subject</th>
                  <th className="text-left px-4 py-3 text-xs text-cream-300/40 font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-xs text-cream-300/40 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((row) => (
                  <tr key={row.id} className="border-b border-cream-300/[0.08]/50 last:border-0 hover:bg-cream-300/[0.02] transition">
                    <td className="px-4 py-3 font-medium">{row.company ?? "—"}</td>
                    <td className="px-4 py-3 text-cream-300/55 max-w-xs truncate">{row.subject ?? "—"}</td>
                    <td className="px-4 py-3 text-cream-300/40">
                      {new Date(row.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        row.status === "sent"
                          ? "bg-green-900/20 text-green-400 border border-green-800/40"
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
