"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { CreditOrder } from "@/types";

const PACKAGES = [
  { id: "starter" as const, name: "Starter", credits: 20, price: "$2", perCredit: "$0.10", popular: false, desc: "Try it out" },
  { id: "pro"     as const, name: "Pro",     credits: 60, price: "$5", perCredit: "$0.083", popular: true,  desc: "Most popular" },
  { id: "power"   as const, name: "Power",  credits: 150, price: "$10",perCredit: "$0.067", popular: false, desc: "Best value" },
];

const COST_TABLE = [
  { action: "Send 1 email",                  cost: "3 credits" },
  { action: "Generate template from resume", cost: "4 credits" },
  { action: "Unlock 1 recruiter contact",    cost: "3–5 credits" },
  { action: "Bulk send (10 emails)",         cost: "25 credits" },
  { action: "First email on signup",         cost: "Free"       },
];

const STATUS_ICON = {
  completed: <CheckCircle2 size={13} className="text-green-400" />,
  pending:   <Clock        size={13} className="text-yellow-400" />,
  failed:    <XCircle      size={13} className="text-red-400" />,
};

const STATUS_COLOR: Record<string, string> = {
  completed: "text-green-400",
  pending:   "text-yellow-400",
  failed:    "text-red-400",
};

export default function CreditsPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [userId, setUserId]   = useState<string | null>(null);
  const [orders, setOrders]   = useState<CreditOrder[]>([]);
  const [buying, setBuying]   = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const uid = data.user.id;
      setUserId(uid);

      (api.credits.balance(uid) as Promise<{ balance: number }>)
        .then(r => setBalance(r.balance))
        .catch(() => null);

      (api.credits.orders(uid) as Promise<{ orders: CreditOrder[] }>)
        .then(r => setOrders(r.orders))
        .catch(() => null);
    });
  }, []);

  // Refresh balance after Stripe success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1" && userId) {
      (api.credits.balance(userId) as Promise<{ balance: number }>)
        .then(r => setBalance(r.balance))
        .catch(() => null);
      (api.credits.orders(userId) as Promise<{ orders: CreditOrder[] }>)
        .then(r => setOrders(r.orders))
        .catch(() => null);
      // Clean up URL
      window.history.replaceState({}, "", "/credits");
    }
  }, [userId]);

  const handleBuy = async (pkg: typeof PACKAGES[0]) => {
    if (!userId) { setError("Not signed in"); return; }
    setBuying(pkg.id); setError(null);
    try {
      const origin = window.location.origin;
      const res = await api.credits.checkout({
        package:      pkg.id,
        success_url:  `${origin}/credits?success=1`,
        cancel_url:   `${origin}/credits`,
      }, userId) as { checkout_url: string };
      window.location.href = res.checkout_url;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Checkout failed";
      setError(msg.includes("not configured")
        ? "Payments not configured yet. Add STRIPE_SECRET_KEY to the API .env file."
        : msg);
      setBuying(null);
    }
  };

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Credits</h1>
          <p className="text-neutral-400 text-sm mt-1">Power your outreach campaigns</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{balance ?? "—"}</p>
          <p className="text-xs text-neutral-500 mt-0.5">credits remaining</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 border border-yellow-900 bg-yellow-950/50 rounded-lg px-4 py-3 text-sm text-yellow-400">
          <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Packages */}
      <div className="grid grid-cols-3 gap-4">
        {PACKAGES.map(pkg => (
          <div key={pkg.name}
            className={cn(
              "border rounded-xl p-5 flex flex-col gap-4 relative transition",
              pkg.popular ? "border-neutral-600 bg-neutral-900/60" : "border-neutral-800"
            )}
          >
            {pkg.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <span className="bg-white text-black text-xs font-semibold px-3 py-0.5 rounded-full">Popular</span>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">{pkg.name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{pkg.desc}</p>
            </div>
            <div>
              <p className="text-4xl font-bold tracking-tight">{pkg.price}</p>
              <p className="text-xs text-neutral-500 mt-1">{pkg.credits} credits · {pkg.perCredit} each</p>
            </div>
            <div className="border-t border-neutral-800 pt-3 space-y-1.5">
              {[
                `${Math.floor(pkg.credits / 3)} emails`,
                `${Math.floor(pkg.credits / 4)} template generations`,
                `${Math.floor(pkg.credits / 4)} contact unlocks`,
              ].map(f => (
                <p key={f} className="text-xs text-neutral-500 flex items-center gap-1.5">
                  <Check size={11} className="text-neutral-600" />{f}
                </p>
              ))}
            </div>
            <button
              onClick={() => handleBuy(pkg)}
              disabled={buying === pkg.id}
              className={cn(
                "w-full py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2",
                pkg.popular
                  ? "bg-white text-black hover:bg-neutral-200 disabled:opacity-60"
                  : "border border-neutral-700 hover:border-neutral-500 text-neutral-300 disabled:opacity-60"
              )}
            >
              {buying === pkg.id
                ? <><Loader2 size={14} className="animate-spin" /> Redirecting…</>
                : `Buy ${pkg.credits} credits`}
            </button>
          </div>
        ))}
      </div>

      {/* Cost reference */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Credit costs</h2>
        <div className="border border-neutral-800 rounded-xl overflow-hidden">
          {COST_TABLE.map((row, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/50 last:border-0">
              <span className="text-sm text-neutral-300">{row.action}</span>
              <span className="text-sm font-medium text-neutral-400">{row.cost}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order history */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Purchase history</h2>
        <div className="border border-neutral-800 rounded-xl overflow-hidden">
          {orders.length === 0 ? (
            <p className="px-4 py-8 text-sm text-neutral-600 text-center">No purchases yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/50">
                  <th className="text-left px-4 py-3 text-xs text-neutral-500 font-medium">Package</th>
                  <th className="text-left px-4 py-3 text-xs text-neutral-500 font-medium">Credits</th>
                  <th className="text-left px-4 py-3 text-xs text-neutral-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-xs text-neutral-500 font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-xs text-neutral-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-900/30 transition">
                    <td className="px-4 py-3 capitalize font-medium">{order.package}</td>
                    <td className="px-4 py-3 text-neutral-300">+{order.credits}</td>
                    <td className="px-4 py-3 text-neutral-400">
                      ${(order.amount_usd_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("flex items-center gap-1.5 text-xs", STATUS_COLOR[order.status])}>
                        {STATUS_ICON[order.status as keyof typeof STATUS_ICON]}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
