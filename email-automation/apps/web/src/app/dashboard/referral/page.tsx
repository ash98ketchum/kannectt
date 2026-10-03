"use client";

import { useState, useEffect } from "react";
import { Gift, Copy, Check, Users, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

interface ReferralStats {
  referral_code: string;
  referral_url: string;
  total_referrals: number;
  credits_earned: number;
}

export default function ReferralPage() {
  const [stats, setStats]     = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const origin = window.location.origin;
      (api.referral.stats(data.user.id, origin) as Promise<ReferralStats>)
        .then(r => setStats(r))
        .catch(() => null)
        .finally(() => setLoading(false));
    });
  }, []);

  const copyLink = () => {
    if (!stats?.referral_url) return;
    navigator.clipboard.writeText(stats.referral_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-light text-cream-200 tracking-tight">Refer &amp; Earn</h1>
        <p className="text-cream-300/55 text-sm mt-1">Share your link — earn 50 credits for every friend who signs up</p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Gift,  title: "Share your link",    desc: "Send your unique referral URL to friends" },
          { icon: Users, title: "Friend signs up",    desc: "They create a real account using your link" },
          { icon: Zap,   title: "You earn 50 credits", desc: "Credited to your account automatically" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="border border-cream-300/[0.08] rounded-xl p-4 flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-cream-300/[0.06] border border-cream-300/20 flex items-center justify-center">
              <Icon size={14} className="text-cream-300" />
            </div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-cream-300/40">{desc}</p>
          </div>
        ))}
      </div>

      {/* Your referral link */}
      <div className="border border-cream-300/[0.08] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-cream-200">Your referral link</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-cream-300/40 text-sm">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : stats ? (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#13120E] border border-cream-300/[0.12] rounded-lg px-3 py-2.5 text-sm font-mono text-cream-300/55 truncate">
                {stats.referral_url}
              </div>
              <button
                onClick={copyLink}
                className="shrink-0 flex items-center gap-1.5 bg-cream-300 text-[#0A0905] px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-cream-200 transition"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-cream-300/30">
              Code: <span className="font-mono text-cream-300/55">{stats.referral_code}</span>
            </p>
          </>
        ) : (
          <p className="text-sm text-cream-300/40">Could not load referral link. Try refreshing.</p>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-cream-300/[0.08] rounded-xl p-5">
            <p className="text-xs text-cream-300/40">Friends referred</p>
            <p className="text-3xl font-bold mt-1">{stats.total_referrals}</p>
          </div>
          <div className="border border-cream-300/[0.08] rounded-xl p-5">
            <p className="text-xs text-cream-300/40">Credits earned from referrals</p>
            <p className="text-3xl font-bold mt-1 text-cream-300">+{stats.credits_earned}</p>
          </div>
        </div>
      )}

      {/* Rules */}
      <div className="border border-cream-300/[0.08] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-medium text-cream-300/55">Rules</h3>
        <ul className="space-y-2">
          {[
            "Your friend must sign up with a real, non-disposable email address",
            "Temporary / burner email services are automatically blocked",
            "Each friend can only be referred once (one reward per referee)",
            "You cannot refer yourself",
            "Credits are added instantly when your friend verifies their email",
          ].map(rule => (
            <li key={rule} className="flex items-start gap-2 text-xs text-cream-300/40">
              <Check size={11} className="text-cream-300/30 mt-0.5 shrink-0" />
              {rule}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
