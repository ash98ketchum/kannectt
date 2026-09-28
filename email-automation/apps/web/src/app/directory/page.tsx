"use client";

import { useState } from "react";
import { Lock, MapPin, Building2, ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CONTACTS = [
  { id: "1", name: "Sarah M.",   title: "Engineering Recruiter",    company: "Google",    dept: "Engineering", location: "San Francisco", seniority: "Senior",  masked: "s●●●●@google.com",    cost: 3 },
  { id: "2", name: "James K.",   title: "Technical Recruiter",      company: "Stripe",    dept: "Engineering", location: "New York",       seniority: "Mid",     masked: "j●●●●@stripe.com",    cost: 3 },
  { id: "3", name: "Priya N.",   title: "Talent Acquisition Lead",  company: "OpenAI",    dept: "AI Research", location: "San Francisco", seniority: "Lead",    masked: "p●●●●@openai.com",    cost: 4 },
  { id: "4", name: "Marcus T.",  title: "University Recruiter",     company: "Meta",      dept: "University",  location: "Menlo Park",    seniority: "Mid",     masked: "m●●●●@meta.com",      cost: 3 },
  { id: "5", name: "Anika R.",   title: "Senior Recruiter",         company: "Anthropic", dept: "Engineering", location: "San Francisco", seniority: "Senior",  masked: "a●●●●@anthropic.com", cost: 4 },
  { id: "6", name: "David L.",   title: "Recruiting Manager",       company: "Notion",    dept: "Engineering", location: "Remote",        seniority: "Manager", masked: "d●●●●@notion.so",     cost: 5 },
];

const DEPTS = ["All", "Engineering", "AI Research", "University"];

export default function DirectoryPage() {
  const [dept, setDept]       = useState("All");
  const [cart, setCart]       = useState<string[]>([]);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [credits, setCredits] = useState(7);

  const filtered = dept === "All" ? CONTACTS : CONTACTS.filter(c => c.dept === dept);
  const cartCost = cart.reduce((s, id) => s + (CONTACTS.find(c => c.id === id)?.cost ?? 0), 0);

  const toggle = (id: string) =>
    setCart(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const unlockAll = () => {
    if (credits < cartCost) return;
    setUnlocked(u => [...u, ...cart]);
    setCredits(c => c - cartCost);
    setCart([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recruiter Directory</h1>
          <p className="text-neutral-400 text-sm mt-1">{CONTACTS.length} verified contacts · unlock emails with credits</p>
        </div>
        {cart.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400">{cart.length} selected · {cartCost} credits</span>
            <button
              onClick={unlockAll}
              disabled={credits < cartCost}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Lock size={13} />
              Unlock selected
            </button>
          </div>
        )}
      </div>

      {/* Dept filter */}
      <div className="flex gap-2">
        {DEPTS.map(d => (
          <button
            key={d}
            onClick={() => setDept(d)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition border",
              d === dept
                ? "bg-white text-black border-white"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Low credits warning */}
      {cart.length > 0 && credits < cartCost && (
        <div className="border border-yellow-900 bg-yellow-950/50 rounded-lg px-4 py-3 text-sm text-yellow-400 flex items-center justify-between">
          <span>Not enough credits. Need {cartCost}, have {credits}.</span>
          <a href="/credits" className="underline text-yellow-300">Buy more</a>
        </div>
      )}

      {/* Contact list */}
      <div className="space-y-2">
        {filtered.map(contact => {
          const isUnlocked = unlocked.includes(contact.id);
          const inCart     = cart.includes(contact.id);
          return (
            <div
              key={contact.id}
              className={cn(
                "border rounded-xl px-4 py-3.5 flex items-center gap-4 transition",
                inCart ? "border-neutral-600 bg-neutral-900/60" : "border-neutral-800 hover:border-neutral-700"
              )}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold text-neutral-400 shrink-0">
                {contact.name[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{contact.name}</span>
                  <span className="text-xs text-neutral-500 border border-neutral-700 rounded px-1.5 py-0.5">{contact.seniority}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <Building2 size={10} />{contact.title} · {contact.company}
                  </span>
                  <span className="text-xs text-neutral-600 flex items-center gap-1">
                    <MapPin size={10} />{contact.location}
                  </span>
                </div>
              </div>

              {/* Email */}
              <span className={cn(
                "text-xs font-mono min-w-[190px] text-right",
                isUnlocked ? "text-green-400" : "text-neutral-600"
              )}>
                {isUnlocked ? `unlocked@${contact.company.toLowerCase()}.com` : contact.masked}
              </span>

              {/* Action */}
              {isUnlocked ? (
                <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium px-3 py-1.5 bg-green-950 border border-green-900 rounded-lg">
                  <Check size={12} /> Unlocked
                </span>
              ) : (
                <button
                  onClick={() => toggle(contact.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border",
                    inCart
                      ? "bg-neutral-700 border-neutral-600 text-white"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
                  )}
                >
                  <ShoppingCart size={12} />
                  {inCart ? `In cart · ${contact.cost}cr` : `+${contact.cost}cr`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
