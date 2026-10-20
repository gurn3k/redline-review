"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GA_ID, isTrackedPath, startAnalytics } from "@/lib/analytics";

let started = false;

// Starts Google Analytics the first time a public page is shown. A visit that
// begins in the signed-in area never loads it (see lib/analytics.ts).
export function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (!GA_ID || started || !isTrackedPath(pathname)) return;
    started = true;
    startAnalytics(window as unknown as Parameters<typeof startAnalytics>[0], document, GA_ID);
  }, [pathname]);
  return null;
}
