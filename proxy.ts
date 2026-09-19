import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts` (same
// behavior, new name/export — see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
// This is that file: it refreshes the Supabase session cookie on every
// request and redirects unauthenticated visitors away from the authenticated
// area, per @supabase/ssr's documented Next.js proxy/middleware pattern.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
