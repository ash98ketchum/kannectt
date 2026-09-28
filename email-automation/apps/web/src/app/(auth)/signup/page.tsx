"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

const STRENGTH = [
  { label: "8+ characters",       test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter",    test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number",              test: (p: string) => /\d/.test(p) },
];

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/dashboard` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-green-950 border border-green-800 flex items-center justify-center mx-auto">
          <Check size={20} className="text-green-400" />
        </div>
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="text-neutral-400 text-sm">
          We sent a confirmation link to <strong className="text-neutral-200">{email}</strong>.
          Click it to activate your account and get your free credit.
        </p>
        <Link href="/login" className="text-xs text-neutral-500 hover:text-neutral-300 transition underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="text-neutral-400 text-sm">Start free — 1 email included, no card needed</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            placeholder="you@example.com"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 pr-10 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition"
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {/* Password strength */}
          {password && (
            <div className="space-y-1 pt-1">
              {STRENGTH.map(({ label, test }) => (
                <p key={label} className={`text-xs flex items-center gap-1.5 transition ${test(password) ? "text-green-400" : "text-neutral-600"}`}>
                  <Check size={10} className={test(password) ? "opacity-100" : "opacity-0"} />
                  {label}
                </p>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-xs text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-neutral-300 hover:text-white transition underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
