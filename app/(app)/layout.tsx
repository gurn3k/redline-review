import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

// The proxy (proxy.ts) already redirects unauthenticated requests away from
// this route group. This check runs again here, close to the actual render,
// per Next's auth guidance not to rely on the proxy/middleware layer alone.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="page">
      <header className="nav">
        <Link href="/home" className="wordmark">
          REDLINE
        </Link>
        <LogoutButton />
      </header>

      <main className="app-main measure">{children}</main>
    </div>
  );
}
