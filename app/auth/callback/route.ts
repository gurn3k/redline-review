import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Google and LinkedIn send the reader back after they approve
 * sign-in. Supabase appends a one-time `code`; swapping it for a session
 * sets the auth cookies, then the reader lands on /home.
 *
 * The destination is fixed on purpose. Reading a "next" URL from the query
 * string would turn this route into an open redirect, and every signed-in
 * reader starts at /home anyway. The browser holds the PKCE verifier, so a
 * stolen `code` is useless to anyone else.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const supabase = await createClient();

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  // No code (the reader cancelled, or the provider returned an error) or the
  // exchange failed. The login page shows a fixed message for this flag;
  // provider error text is never echoed back to the page.
  return NextResponse.redirect(new URL("/login?error=oauth", request.url));
}
