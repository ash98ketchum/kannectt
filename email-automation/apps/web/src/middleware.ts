import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ── Short-circuit public routes before touching Supabase ─────────────────
  if (PUBLIC_ROUTES.includes(path)) {
    return NextResponse.next({ request });
  }

  // ── Guard: skip auth check if Supabase isn't configured yet ──────────────
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const configured =
    url.startsWith("https://") && !url.includes("placeholder") && key.length > 20;

  if (!configured) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Real auth check ───────────────────────────────────────────────────────
  const response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
      },
      remove(name: string, options: Record<string, unknown>) {
        response.cookies.set(name, "", options as Parameters<typeof response.cookies.set>[2]);
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect logged-in users away from auth pages
  if (path === "/login" || path === "/signup") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
