"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PACKAGES = [
  {
    name: "Starter",
    credits: 20,
    price: "$2",
    priceNum: 2,
    perCredit: "$0.10",
    popular: false,
    desc: "Try it out",
  },
  {
    name: "Pro",
    credits: 60,
    price: "$5",
    priceNum: 5,
    perCredit: "$0.083",
    popular: true,
    desc: "Most popular",
  },
  {
    name: "Power",
    credits: 150,
    price: "$10",
    priceNum: 10,
    perCredit: "$0.067",
    popular: false,
    desc: "Best value",
  },
];

const COST_TABLE = [
  { action: "Send 1 email",                  cost: "3 credits" },
  { action: "Generate template from resume", cost: "4 credits" },
  { action: "Unlock 1 recruiter contact",    cost: "3–5 credits" },
  { action: "Bulk send (10 emails)",         cost: "25 credits" },
  { action: "First email on signup",         cost: "Free" },
];

export default function CreditsPage() {
  const [balance, setBalance] = useState(7);
  const [bought, setBought]   = useState<string | null>(null);

  const handleBuy = (pkg: typeof PACKAGES[0]) => {
    setBalance(b => b + pkg.credits);
    setBought(pkg.name);
    setTimeout(() => setBought(null), 2000);
  };

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Credits</h1>
          <p className="text-neutral-400 text-sm mt-1">Power your outreach campaigns</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{balance}</p>
          <p className="text-xs text-neutral-500 mt-0.5">credits remaining</p>
        </div>
      </div>

      {/* Packages */}
      <div className="grid grid-cols-3 gap-4">
        {PACKAGES.map(pkg => (
          <div
            key={pkg.name}
            className={cn(
              "border rounded-xl p-5 flex flex-col gap-4 relative transition",
              pkg.popular ? "border-neutral-600 bg-neutral-900/60" : "border-neutral-800"
            )}
          >
            {pkg.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <span className="bg-white text-black text-xs font-semibold px-3 py-0.5 rounded-full">
                  Popular
                </span>
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
              className={cn(
                "w-full py-2 rounded-lg text-sm font-medium transition",
                bought === pkg.name
                  ? "bg-green-900 text-green-300 border border-green-800"
                  : pkg.popular
                  ? "bg-white text-black hover:bg-neutral-200"
                  : "border border-neutral-700 hover:border-neutral-500 text-neutral-300"
              )}
            >
              {bought === pkg.name ? `+ ${pkg.credits} credits added!` : `Buy ${pkg.credits} credits`}
            </button>
          </div>
        ))}
      </div>

      {/* Cost reference */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Credit costs</h2>
        <div className="border border-neutral-800 rounded-xl overflow-hidden">
          {COST_TABLE.map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/50 last:border-0"
            >
              <span className="text-sm text-neutral-300">{row.action}</span>
              <span className="text-sm font-medium text-neutral-400">{row.cost}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
