"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    if (!supabase) {
      // Nothing to sign out of if Supabase was never configured.
      router.push("/login");
      return;
    }
    setPending(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" className="cta cta-small" onClick={handleLogout} disabled={pending}>
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
