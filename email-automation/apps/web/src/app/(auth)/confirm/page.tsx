"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Suspense } from "react";

type Status = "verifying" | "success" | "error";

function ConfirmContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const tokenHash = params.get("token_hash");
    const type = params.get("type") as "email" | "recovery" | "invite" | null;

    async function verify() {
      const supabase = createClient();

      // Case 1: PKCE flow — token_hash + type in the query string
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });

        if (error) {
          setErrorMsg(error.message);
          setStatus("error");
        } else {
          setStatus("success");
        }
        return;
      }

      // Case 2: Implicit flow — Supabase puts the session in the URL hash.
      // detectSessionInUrl:true (in client.ts) already handles this automatically.
      // We just need to wait a tick and check if a session was established.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setStatus("success");
      } else {
        setErrorMsg("Verification link is invalid or has expired.");
        setStatus("error");
      }
    }

    verify();
  }, [params]);

  /* ── Verifying ─────────────────────────────────────────────────────────── */
  if (status === "verifying") {
    return (
      <div className="space-y-6 text-center">
        <Loader2 size={36} className="animate-spin text-cream-300 mx-auto" />
        <div>
          <h1 className="font-display text-3xl font-light text-[#E8DDD0] tracking-tight">
            Verifying your email…
          </h1>
          <p className="text-[#6B6456] text-sm mt-2">
            Hold tight, this only takes a second.
          </p>
        </div>
      </div>
    );
  }

  /* ── Success ────────────────────────────────────────────────────────────── */
  if (status === "success") {
    return (
      <div className="space-y-8">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-cream-300/10 border border-cream-300/20 flex items-center justify-center">
          <CheckCircle2 size={26} className="text-cream-300" />
        </div>

        {/* Copy */}
        <div className="space-y-3">
          <h1 className="font-display text-4xl font-light text-[#E8DDD0] leading-[1.1] tracking-tight">
            Email verified.
          </h1>
          <p className="text-[#6B6456] text-sm leading-relaxed">
            Your account is active and ready to go.{" "}
            <br className="hidden sm:block" />
            Sign in to start using Kannectt.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-cream-300 text-[#0A0905] py-4 rounded-2xl text-sm font-semibold hover:bg-cream-200 transition text-center tracking-wide"
          >
            Sign in to your account
          </Link>
          <p className="text-[#3D3A33] text-xs tracking-wide text-center">
            Your 300 free credits are waiting.
          </p>
        </div>
      </div>
    );
  }

  /* ── Error ──────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Icon */}
      <div className="w-14 h-14 rounded-full bg-red-950/30 border border-red-900/40 flex items-center justify-center">
        <XCircle size={26} className="text-red-400" />
      </div>

      {/* Copy */}
      <div className="space-y-3">
        <h1 className="font-display text-4xl font-light text-[#E8DDD0] leading-[1.1] tracking-tight">
          Verification failed.
        </h1>
        <p className="text-[#6B6456] text-sm leading-relaxed">
          {errorMsg ?? "This link has expired or is invalid."}
        </p>
      </div>

      {/* CTAs */}
      <div className="space-y-4">
        <Link
          href="/signup"
          className="block w-full bg-cream-300 text-[#0A0905] py-4 rounded-2xl text-sm font-semibold hover:bg-cream-200 transition text-center tracking-wide"
        >
          Back to Sign up
        </Link>
        <p className="text-[#3D3A33] text-xs tracking-wide text-center">
          Already verified?{" "}
          <Link href="/login" className="text-cream-300 hover:text-cream-200 transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ── Page wrapper — Suspense required for useSearchParams in Next.js 14+ ── */
export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-2 text-[#6B6456] text-sm py-10">
          <Loader2 size={14} className="animate-spin" />
          Loading…
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
