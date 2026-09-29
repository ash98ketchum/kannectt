"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="space-y-10">

      {/* Heading */}
      <div>
        <h1 className="font-display text-5xl font-light text-[#E8DDD0] leading-[1.1] tracking-tight">
          Welcome back.
        </h1>
        <p className="text-[#6B6456] text-sm mt-3 tracking-wide">
          Sign in to your account
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">

        {/* Email */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-[#6B6456] tracking-[0.2em] uppercase block">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            placeholder="you@example.com"
            className="w-full bg-[#13120E] border border-[#2A2820] rounded-xl px-4 py-3.5 text-sm text-[#E8DDD0] placeholder:text-[#3D3A33] focus:outline-none focus:border-[#6B6456] transition"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-[#6B6456] tracking-[0.2em] uppercase block">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[#13120E] border border-[#2A2820] rounded-xl px-4 py-3.5 pr-12 text-sm text-[#E8DDD0] placeholder:text-[#3D3A33] focus:outline-none focus:border-[#6B6456] transition"
            />
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3D3A33] hover:text-[#6B6456] transition"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400/80 bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cream-300 text-[#0A0905] py-4 rounded-2xl text-sm font-semibold hover:bg-cream-200 transition disabled:opacity-50 flex items-center justify-center gap-2 tracking-wide"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-[#3D3A33] text-xs tracking-wide">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-cream-300 hover:text-cream-200 transition">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
