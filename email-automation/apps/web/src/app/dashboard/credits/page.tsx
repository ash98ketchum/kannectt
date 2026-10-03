"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { Check, Loader2, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { CreditOrder } from "@/types";

/* ─── Razorpay window type ───────────────────────────────────────────────── */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

/* ─── Package config ─────────────────────────────────────────────────────── */
const PACKAGES = [
  { id: "starter" as const, name: "Starter", credits: 20,  price: "₹20",  perCredit: "₹1.00",  popular: false, desc: "Try it out"    },
  { id: "pro"     as const, name: "Pro",     credits: 60,  price: "₹50",  perCredit: "₹0.83",  popular: true,  desc: "Most popular"  },
  { id: "power"   as const, name: "Power",  credits: 150,  price: "₹100", perCredit: "₹0.67",  popular: false, desc: "Best value"    },
];

const COST_TABLE = [
  { action: "Send 1 email",                  cost: "3 credits"   },
  { action: "Generate template from resume", cost: "4 credits"   },
  { action: "Unlock 1 recruiter contact",    cost: "3–5 credits" },
  { action: "Bulk send (10 emails)",         cost: "25 credits"  },
  { action: "First email on signup",         cost: "Free"        },
];

const STATUS_ICON = {
  completed: <CheckCircle2 size={13} className="text-green-400" />,
  pending:   <Clock        size={13} className="text-yellow-400" />,
  failed:    <XCircle      size={13} className="text-red-400"   />,
};

const STATUS_COLOR: Record<string, string> = {
  completed: "text-green-400",
  pending:   "text-yellow-400",
  failed:    "text-red-400",
};

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function CreditsPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [userId,  setUserId]  = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [orders,  setOrders]  = useState<CreditOrder[]>([]);
  const [buying,  setBuying]  = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  /* Load balance + order history on mount */
  useEffect(() => {
    // Use getSession for more reliable client-side auth detection
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      const uid = session.user.id;
      setUserId(uid);
      setUserEmail(session.user.email ?? "");

      (api.credits.balance(uid) as Promise<{ balance: number }>)
        .then(r => setBalance(r.balance))
        .catch(() => null);

      (api.credits.orders(uid) as Promise<{ orders: CreditOrder[] }>)
        .then(r => setOrders(r.orders))
        .catch(() => null);
    });
  }, []);

  /* ── Main buy handler ────────────────────────────────────────────────── */
  const handleBuy = async (pkg: typeof PACKAGES[0]) => {
    if (!userId) { setError("Not signed in"); return; }
    setBuying(pkg.id);
    setError(null);

    try {
      /* Step 1 — Create Razorpay order on backend */
      const order = await api.credits.createOrder(
        { package: pkg.id },
        userId,
      ) as { order_id: string; amount: number; currency: string };

      /* Step 2 — Wait for Razorpay script (max 5 s) then open modal */
      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!rzpKey) throw new Error("Razorpay key not configured.");

      // Poll until window.Razorpay is available (script loads async)
      await new Promise<void>((resolve, reject) => {
        if (window.Razorpay) return resolve();
        let tries = 0;
        const id = setInterval(() => {
          if (window.Razorpay) { clearInterval(id); resolve(); }
          else if (++tries > 50) { clearInterval(id); reject(new Error("Razorpay script failed to load. Check your internet connection.")); }
        }, 100);
      });

      const rzp = new window.Razorpay({
        key:         rzpKey,
        order_id:    order.order_id,
        amount:      order.amount,
        currency:    order.currency,
        name:        "kannectt",
        description: `${pkg.credits} credits — ${pkg.name} plan`,
        image:       "/favicon.ico",

        /* Pre-fill user's email so they don't have to type it */
        prefill: {
          email: userEmail,
        },

        /* UPI-first display — UPI block pinned at top, cards/netbanking below */
        config: {
          display: {
            blocks: {
              upi: {
                name:        "Pay via UPI",
                instruments: [
                  { method: "upi" },          // covers GPay, PhonePe, BHIM, Paytm, etc.
                ],
              },
              other: {
                name:        "Other methods",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" },
                ],
              },
            },
            sequence:    ["block.upi", "block.other"],
            preferences: { show_default_blocks: false },
          },
        },

        theme: { color: "#ffffff" },

        /* Step 3 — On successful payment, verify with backend */
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const result = await api.payments.verify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              user_id:             userId,
              package:             pkg.id,
            }) as { success: boolean; credits_added: number; new_balance: number };

            if (result.success) {
              setBalance(result.new_balance);
              /* Refresh order history */
              (api.credits.orders(userId) as Promise<{ orders: CreditOrder[] }>)
                .then(r => setOrders(r.orders))
                .catch(() => null);
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed");
          } finally {
            setBuying(null);
          }
        },

        /* Modal dismissed / payment failed */
        modal: {
          ondismiss: () => {
            setBuying(null);
            setError("Payment cancelled.");
          },
        },
      });

      rzp.on("payment.failed", (resp: { error: { description: string } }) => {
        setBuying(null);
        setError(`Payment failed: ${resp.error.description}`);
      });

      rzp.open();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Checkout failed";
      setError(msg.includes("not configured")
        ? "Payments not configured yet. Add RAZORPAY_KEY_ID to the API .env file."
        : msg);
      setBuying(null);
    }
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Load Razorpay checkout.js — afterInteractive ensures it loads before user clicks */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

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
                  ? <><Loader2 size={14} className="animate-spin" /> Opening payment…</>
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
                        ₹{(order.amount_inr_paise / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {new Date(order.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
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
    </>
  );
}
