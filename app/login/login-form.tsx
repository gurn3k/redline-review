"use client";

import { SiteHeader } from "@/app/components/site-header";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

// Supabase provider IDs. LinkedIn's current sign-in is OpenID Connect
// ("linkedin_oidc"); the older "linkedin" provider is deprecated.
type OAuthProvider = "google" | "linkedin_oidc";

const NOT_CONFIGURED_MESSAGE =
  "Sign-in isn't set up on this deployment yet. Ask whoever runs Redline to add the Supabase credentials.";

const OAUTH_FAILED_MESSAGE =
  "That sign-in didn't go through. Try again, or use your email and password.";

export function LoginForm({ oauthFailed }: { oauthFailed: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    oauthFailed ? OAUTH_FAILED_MESSAGE : null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  const isSignup = mode === "signup";

  async function handleOAuth(provider: OAuthProvider) {
    setError(null);
    setNotice(null);

    const supabase = createClient();
    if (!supabase) {
      setError(NOT_CONFIGURED_MESSAGE);
      return;
    }

    setPending(true);
    // On success the browser leaves for the provider's consent screen, so
    // pending stays on. The return address must be on Supabase's redirect
    // allow-list, which is what stops it pointing anywhere else.
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError(OAUTH_FAILED_MESSAGE);
      setPending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const supabase = createClient();
    if (!supabase) {
      setError(NOT_CONFIGURED_MESSAGE);
      return;
    }

    setPending(true);
    try {
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        if (!data.session) {
          setNotice("Check your inbox to confirm your account, then log in.");
          setMode("login");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message);
          return;
        }
      }
      router.push("/home");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="page">
      <SiteHeader minimal />

      <main className="container auth-main">
        <div className="panel auth-card">
          <h1 className="page-title">
            {isSignup ? "Create your Redline account" : "Log in to Redline"}
          </h1>
          <p className="panel-intro">Know what you&rsquo;re signing before you sign it.</p>

          <div className="auth-providers">
            <button
              type="button"
              className="btn btn-ghost btn-large btn-block"
              disabled={pending}
              onClick={() => handleOAuth("google")}
            >
              Continue with Google
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-large btn-block"
              disabled={pending}
              onClick={() => handleOAuth("linkedin_oidc")}
            >
              Continue with LinkedIn
            </button>
          </div>

          <p className="auth-divider">
            <span>or use your email</span>
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
            />

            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input"
            />

            {error ? (
              <p className="message message-error" role="alert">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="message message-notice" role="status">
                {notice}
              </p>
            ) : null}

            <button type="submit" className="btn btn-primary btn-large btn-block" disabled={pending}>
              {isSignup
                ? pending
                  ? "Creating account…"
                  : "Create account"
                : pending
                  ? "Logging in…"
                  : "Log in"}
            </button>
          </form>

          <button
            type="button"
            className="text-button auth-toggle"
            onClick={() => {
              setMode(isSignup ? "login" : "signup");
              setError(null);
              setNotice(null);
            }}
          >
            {isSignup ? "Already have an account? Log in" : "New here? Create an account"}
          </button>
        </div>
      </main>
    </div>
  );
}
