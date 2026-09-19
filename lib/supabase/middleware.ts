import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Routes reachable without a session. Everything else sits behind the
 * `app/(app)/` route group and requires a signed-in user.
 */
function isPublicRoute(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/login");
}

/**
 * Refreshes the Supabase session cookie on every request and gates the
 * authenticated area. Called from `proxy.ts` (Next.js 16's renamed
 * `middleware.ts`) so it runs before any route renders.
 *
 * Per `@supabase/ssr`'s documented pattern: read the session with
 * `getAll`/`setAll` against the request/response cookie jars, and always
 * call `supabase.auth.getUser()` — never trust `getSession()` alone here,
 * since only `getUser()` revalidates the token against Supabase.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;

  if (!supabaseUrl || !supabaseAnonKey) {
    // No Supabase project configured yet: there's no session to refresh and
    // no way to sign anyone in, so send the authenticated area to /login,
    // where the "sign-in isn't set up yet" message lives. Public routes
    // still load — the app must be able to start without these env vars.
    if (!isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}
