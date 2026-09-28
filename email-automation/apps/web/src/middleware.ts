import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

const PUBLIC_ROUTES  = ["/", "/login", "/signup"];
const AUTH_ROUTES    = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ── Short-circuit public routes — no Supabase call needed ────────────────
  // Also protects against crash when env vars are placeholder values
  if (PUBLIC_ROUTES.includes(path)) {
    return NextResponse.next({ request });
  }

  // ── Guard: skip if Supabase not configured yet ────────────────────────────
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url.startsWith("https://") || url.includes("placeholder") || key.length < 20) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Auth check ────────────────────────────────────────────────────────────
  const { supabase, supabaseResponse } = createClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged-in users visiting auth pages → send to dashboard
  if (AUTH_ROUTES.includes(path)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
