"use client";

import { useState, useEffect } from "react";
import { Mail, Eye, EyeOff, Check, Loader2, AlertCircle, ExternalLink, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [userId, setUserId]       = useState<string | null>(null);
  const [email, setEmail]         = useState("");
  const [appPassword, setAppPw]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      setLoading(true);
      (api.profile.getGmail(data.user.id) as Promise<{ sender_email: string; is_configured: boolean }>)
        .then(r => {
          setConfigured(r.is_configured);
          setCurrentEmail(r.sender_email || "");
          if (r.sender_email) setEmail(r.sender_email);
        })
        .catch(() => null)
        .finally(() => setLoading(false));
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true); setError(null); setSaved(false);

    try {
      await api.profile.saveGmail(userId, {
        sender_email: email,
        gmail_app_password: appPassword,
      });
      setConfigured(true);
      setCurrentEmail(email);
      setAppPw("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-xl">

      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-light text-cream-200 tracking-tight">Gmail Settings</h1>
        <p className="text-cream-300/55 text-sm mt-1">
          Connect your Gmail so emails are sent from <strong className="text-cream-200">your own address</strong> — not ours.
        </p>
      </div>

      {/* Status badge */}
      {!loading && (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm ${
          configured
            ? "border-green-800/40 bg-green-900/20/40 text-green-400"
            : "border-yellow-900 bg-yellow-950/40 text-yellow-400"
        }`}>
          {configured
            ? <><Check size={14} /> Sending from <strong>{currentEmail}</strong></>
            : <><AlertCircle size={14} /> Not configured — you cannot send emails until this is set up</>
          }
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-5">

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-cream-300/55">Your Gmail address</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-300/30" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@gmail.com"
              className="w-full bg-[#13120E] border border-cream-300/[0.12] rounded-lg pl-9 pr-3 py-2.5 text-sm placeholder:text-cream-300/30 focus:outline-none focus:border-neutral-500 transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-cream-300/55">Gmail App Password</label>
            <a
              href="https://myaccount.google.com/apppasswords"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
            >
              Generate one <ExternalLink size={10} />
            </a>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={appPassword}
              onChange={e => setAppPw(e.target.value)}
              required={!configured}
              placeholder={configured ? "Leave blank to keep existing password" : "xxxx xxxx xxxx xxxx"}
              className="w-full bg-[#13120E] border border-cream-300/[0.12] rounded-lg px-3 py-2.5 pr-10 text-sm font-mono placeholder:text-cream-300/30 placeholder:font-sans focus:outline-none focus:border-neutral-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-300/30 hover:text-cream-300/55 transition"
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <p className="text-xs text-cream-300/30 flex items-center gap-1.5">
            <Shield size={10} /> Stored encrypted — never visible after saving
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-cream-300 text-[#0A0905] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-cream-200 transition disabled:opacity-50"
        >
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> :
           saved  ? <><Check size={14} className="text-green-600" /> Saved!</> :
           "Save Gmail settings"}
        </button>
      </form>

      {/* How to get App Password guide */}
      <div className="border border-cream-300/[0.08] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-medium">How to get a Gmail App Password</h3>
        <ol className="space-y-2">
          {[
            "Go to myaccount.google.com → Security",
            'Enable "2-Step Verification" if not already on',
            'Search for "App passwords" in the search bar',
            'Select app: "Mail" → Select device: "Other" → type "kannectt"',
            "Copy the 16-character password and paste it above",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-cream-300/40">
              <span className="font-mono text-cream-300/30 shrink-0 mt-0.5">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
        <a
          href="https://myaccount.google.com/apppasswords"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition"
        >
          Open App Passwords page <ExternalLink size={11} />
        </a>
      </div>

    </div>
  );
}
