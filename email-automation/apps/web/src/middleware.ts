import { type NextRequest, NextResponse } from "next/server";

// Static export: middleware is a no-op — auth is handled client-side via Supabase JS SDK
export async function middleware(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [], // disabled — no routes intercepted
};
