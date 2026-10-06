import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "./app-nav";
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
      <header className="site-header">
        <div className="container header-row">
          <Link href="/home" className="wordmark">
            <span className="wordmark-rule" aria-hidden="true" />
            Redline
          </Link>
          <div className="header-right">
            <AppNav />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container app-main">{children}</main>
    </div>
  );
}
