"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

const NOT_CONFIGURED_MESSAGE =
  "Sign-in isn't set up on this deployment yet. Ask whoever runs Redline to add the Supabase credentials.";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignup = mode === "signup";

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
      <header className="nav">
        <Link href="/" className="wordmark">
          REDLINE
        </Link>
      </header>

      <main className="auth-main measure">
        <div className="auth-card">
          <p className="auth-eyebrow tabular">§ SIGN IN</p>
          <h1 className="auth-heading">
            {isSignup ? "Create your Redline account" : "Log in to Redline"}
          </h1>
          <p className="auth-sub">Review a contract before you sign it.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label" htmlFor="email">
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
              className="auth-input"
            />

            <label className="auth-label" htmlFor="password">
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
              className="auth-input"
            />

            {error ? (
              <p className="auth-message auth-message-error" role="alert">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="auth-message auth-message-notice" role="status">
                {notice}
              </p>
            ) : null}

            <button type="submit" className="cta cta-large auth-submit" disabled={pending}>
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
            className="auth-toggle"
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
