"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";

function GoogleIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.479 14.265v-3.279h11.049c.108.571.164 1.247.164 1.979 0 2.46-.672 5.502-2.84 7.669C18.744 22.829 16.051 24 12.483 24 5.869 24 .308 18.613.308 12S5.869 0 12.483 0c3.659 0 6.265 1.436 8.223 3.307L18.392 5.62c-1.404-1.317-3.307-2.341-5.913-2.341C7.65 3.279 3.873 7.171 3.873 12s3.777 8.721 8.606 8.721c3.132 0 4.916-1.258 6.059-2.401.927-.927 1.537-2.251 1.777-4.059l-7.854.004z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function AuthTwoPreview() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus email input on load if not submitted
    if (!submitted) {
      inputRef.current?.focus();
    }
  }, [submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Strict email check
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      inputRef.current?.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 380);
  };

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 py-16 sm:px-6 select-none">
      {/* Top back navigation: 44px hit target with optical icon nudge */}
      <nav className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="group inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs font-medium text-tx-2 transition-colors hover:text-tx focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Return to landing page"
        >
          <svg
            className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Back</span>
        </Link>
      </nav>

      {/* Atmospheric depth: subtle radial spotlight centered behind the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(58,169,159,0.06)_0%,rgba(16,15,15,0)_70%)] blur-3xl"
      />

      {/* Main Authentication Card */}
      <div className="relative w-full max-w-[400px]">
        {/* Concentric hairline perimeter aura (outerRadius = 24px, cardRadius = 16px, padding = 8px) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 rounded-[1.5rem] border border-tx/[0.04] shadow-[0_0_80px_rgba(0,0,0,0.9)]"
        />

        {/* The Card Surface */}
        <div className="relative flex flex-col rounded-2xl border border-tx/10 bg-[#161514]/95 p-7 sm:p-8 backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_54px_-12px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          {/* Brand header: Wordmark + optical balance */}
          <div className="flex flex-col items-center text-center space-y-3.5">
            <Wordmark size="sm" />

            <div className="space-y-1 pt-1">
              <h1 className="font-serif text-[1.65rem] sm:text-[1.75rem] tracking-tight text-tx leading-tight [text-wrap:balance]">
                Welcome back
              </h1>
              <p className="text-[0.8125rem] text-tx-2 font-normal [text-wrap:pretty]">
                Log in to continue to your notebook
              </p>
            </div>
          </div>

          {/* Form & Actions */}
          <div className="mt-7 space-y-5">
            {submitted ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-xl border border-accent/25 bg-accent/10 p-5 text-center space-y-2.5 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-tx">
                  Sign-in link sent
                </p>
                <p className="text-[0.75rem] text-tx-2 leading-relaxed">
                  We emailed a secure sign-in link to{" "}
                  <span className="text-tx font-mono font-medium">{email}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                  className="inline-flex min-h-8 items-center justify-center text-[0.75rem] text-accent underline underline-offset-4 hover:brightness-110 cursor-pointer transition-all"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                <div className="space-y-1.5 text-start">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="auth-email"
                      className="block text-[0.6875rem] font-medium tracking-wider uppercase text-tx-2"
                    >
                      Email address
                    </label>
                    {error ? (
                      <span
                        id="email-error"
                        role="alert"
                        className="text-[0.6875rem] text-error font-medium animate-in fade-in duration-150"
                      >
                        {error}
                      </span>
                    ) : null}
                  </div>

                  {/* Concentric input container: 44px touch target (h-11), 12px inner radius (rounded-xl) */}
                  <div
                    className={`group relative flex h-11 items-center rounded-xl border bg-ui/35 transition-all duration-150 ${
                      error
                        ? "border-error shadow-[0_0_0_1px_rgba(209,77,65,0.7),0_0_12px_rgba(209,77,65,0.18)]"
                        : "border-tx/12 hover:border-tx/20 focus-within:border-accent focus-within:bg-ui/50 focus-within:shadow-[0_0_0_1px_rgba(58,169,159,0.7),0_0_12px_rgba(58,169,159,0.18)]"
                    }`}
                  >
                    <span
                      className={`pointer-events-none flex items-center ps-3.5 pe-2.5 transition-colors duration-150 ${
                        error
                          ? "text-error"
                          : "text-tx-3 group-focus-within:text-accent"
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        className="size-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <input
                      ref={inputRef}
                      id="auth-email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="name@example.com"
                      autoComplete="email"
                      inputMode="email"
                      spellCheck="false"
                      autoCapitalize="none"
                      autoCorrect="off"
                      aria-required="true"
                      aria-invalid={error ? "true" : "false"}
                      aria-describedby={error ? "email-error" : undefined}
                      style={{ outline: "none", boxShadow: "none" }}
                      className="h-full w-full bg-transparent pe-3.5 text-[0.8125rem] text-tx placeholder:text-tx-3 border-0 ring-0 focus:ring-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0 [outline:none!important] [outline-offset:0!important]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-accent h-11 w-full justify-center rounded-xl text-[0.8125rem] font-medium cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.25)] transition-all duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="size-3.5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Sending link...</span>
                    </span>
                  ) : (
                    <span>Continue with email</span>
                  )}
                </button>
              </form>
            )}

            {/* Subtle separator: 16px inter-group rhythm */}
            <div className="relative flex items-center py-0.5" aria-hidden="true">
              <div className="w-full border-t border-tx/[0.08]" />
              <span className="px-3 text-[0.6875rem] font-medium text-tx-3 bg-[#161514] shrink-0">
                or
              </span>
              <div className="w-full border-t border-tx/[0.08]" />
            </div>

            {/* Secondary OAuth grid: 44px touch target (h-11), optical icon spacing */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2.5 rounded-xl border border-tx/10 bg-ui/25 px-3 text-xs font-medium text-tx-2 hover:text-tx hover:bg-ui/50 hover:border-tx/20 transition-all duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer"
                onClick={() =>
                  alert("Redirects to Google authentication in production on app.socratink.ai.")
                }
              >
                <GoogleIcon />
                <span>Google</span>
              </button>

              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2.5 rounded-xl border border-tx/10 bg-ui/25 px-3 text-xs font-medium text-tx-2 hover:text-tx hover:bg-ui/50 hover:border-tx/20 transition-all duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer"
                onClick={() =>
                  alert("Redirects to GitHub authentication in production on app.socratink.ai.")
                }
              >
                <GithubIcon />
                <span>GitHub</span>
              </button>
            </div>
          </div>

          {/* Legal footer: WCAG AAA compliant text color with 44px tap targets */}
          <footer className="mt-8 text-center text-[0.6875rem] text-tx-2 leading-relaxed">
            By continuing, you agree to our{" "}
            <a
              href="https://socratink.ai"
              className="underline underline-offset-2 hover:text-tx transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-xs"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="https://socratink.ai"
              className="underline underline-offset-2 hover:text-tx transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-xs"
            >
              Privacy Policy
            </a>
            .
          </footer>
        </div>
      </div>
    </div>
  );
}
