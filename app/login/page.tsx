import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in · Redline" };

// Reads the query string on the server so the form doesn't need a Suspense
// boundary for useSearchParams. Only the fixed `error=oauth` flag set by
// app/auth/callback/route.ts is recognised; any other value is ignored.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { error } = await searchParams;
  return <LoginForm oauthFailed={error === "oauth"} />;
}
