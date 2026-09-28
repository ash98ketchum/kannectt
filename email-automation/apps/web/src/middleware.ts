import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ── Short-circuit public routes before touching Supabase ─────────────────
  // This avoids the "URL and Key are required" crash when running locally
  // without real credentials, and also saves a network round-trip on every
  // public page load in production.
  if (PUBLIC_ROUTES.includes(path)) {
    return NextResponse.next({ request });
  }

  // ── Guard: skip auth check if Supabase isn't configured ──────────────────
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const configured = url.startsWith("https://") && !url.includes("placeholder") && key.length > 20;

  if (!configured) {
    // No real Supabase — redirect all protected routes to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Real auth check ───────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll()              { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
