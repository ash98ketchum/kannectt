"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, MapPin, Building2, ShoppingCart, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { ContactPublic } from "@/types";

const DEPTS = ["All", "Engineering", "AI Research", "University", "Product", "Sales"];

export default function DirectoryPage() {
  const [contacts, setContacts]   = useState<ContactPublic[]>([]);
  const [dept, setDept]           = useState("All");
  const [cart, setCart]           = useState<string[]>([]);
  const [balance, setBalance]     = useState<number | null>(null);
  const [userId, setUserId]       = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Fetch user + initial contacts
  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      if (!uid) return;
      setUserId(uid);
      (api.credits.balance(uid) as Promise<{ balance: number }>)
        .then(r => setBalance(r.balance))
        .catch(() => null);
      fetchContacts(uid);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchContacts = useCallback(async (uid: string, deptFilter?: string) => {
    setLoading(true); setError(null);
    try {
      const params: Record<string, string> = {};
      if (deptFilter && deptFilter !== "All") params.dept = deptFilter;
      const data = await api.directory.list(uid, params) as ContactPublic[];
      setContacts(data);
    } catch {
      setError("Could not load contacts — the backend may be starting up. Try again in 30 seconds.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onDeptChange = (d: string) => {
    setDept(d);
    if (userId) fetchContacts(userId, d);
  };

  const toggle = (id: string) =>
    setCart(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const cartCost = cart.reduce((s, id) => {
    const c = contacts.find(x => x.id === id);
    return s + (c?.unlock_cost ?? 0);
  }, 0);

  const unlockAll = async () => {
    if (!userId) return;
    setUnlocking(true); setError(null);
    try {
      const res = await api.directory.unlock(userId, cart) as {
        unlocked: ContactPublic[];
        credits_remaining: number;
      };
      // Merge unlocked contacts into state
      setContacts(prev => prev.map(c => {
        const updated = res.unlocked.find(u => u.id === c.id);
        return updated ?? c;
      }));
      setBalance(res.credits_remaining);
      setCart([]);
    } catch {
      setError("Unlock failed — check your credits or try again.");
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recruiter Directory</h1>
          <p className="text-neutral-400 text-sm mt-1">
            {loading ? "Loading…" : `${contacts.length} verified contacts`} · unlock emails with credits
          </p>
        </div>
        <div className="flex items-center gap-4">
          {balance !== null && (
            <div className="text-right">
              <p className="text-2xl font-bold">{balance}</p>
              <p className="text-xs text-neutral-500">credits</p>
            </div>
          )}
          {cart.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-400">{cart.length} selected · {cartCost} credits</span>
              <button
                onClick={unlockAll}
                disabled={unlocking || (balance !== null && balance < cartCost)}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {unlocking ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} />}
                Unlock selected
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 border border-red-900 bg-red-950/50 rounded-lg px-4 py-3 text-sm text-red-400">
          <AlertCircle size={14} /> {error}
          {error.toLowerCase().includes("credit") && (
            <a href="/dashboard/credits" className="ml-auto underline text-red-300">Buy more</a>
          )}
        </div>
      )}

      {/* Dept filter */}
      <div className="flex gap-2 flex-wrap">
        {DEPTS.map(d => (
          <button
            key={d}
            onClick={() => onDeptChange(d)}
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
      {cart.length > 0 && balance !== null && balance < cartCost && (
        <div className="border border-yellow-900 bg-yellow-950/50 rounded-lg px-4 py-3 text-sm text-yellow-400 flex items-center justify-between">
          <span>Not enough credits. Need {cartCost}, have {balance}.</span>
          <a href="/dashboard/credits" className="underline text-yellow-300">Buy more</a>
        </div>
      )}

      {/* Contact list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-neutral-600">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-20 text-neutral-600 text-sm">No contacts found</div>
      ) : (
        <div className="space-y-2">
          {contacts.map(contact => {
            const inCart = cart.includes(contact.id);
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
                  "text-xs font-mono min-w-[200px] text-right",
                  contact.is_unlocked ? "text-green-400" : "text-neutral-600"
                )}>
                  {contact.is_unlocked ? contact.email ?? contact.masked_email : contact.masked_email}
                </span>

                {/* Action */}
                {contact.is_unlocked ? (
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
                    {inCart ? `In cart · ${contact.unlock_cost}cr` : `+${contact.unlock_cost}cr`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
