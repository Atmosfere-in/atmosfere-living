"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const siteUrl = () => (typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL);

export function LoginButtons({ next }: { next: string }) {
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callback = `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;

  const google = async () => {
    setError(null);
    setLoading("google");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback, queryParams: { prompt: "select_account" } },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  };

  const magic = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading("email");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: callback } });
    setLoading(null);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="space-y-6">
      <button onClick={google} disabled={!!loading} className="btn w-full border border-stone-200 bg-white text-ink hover:border-ink !tracking-[0.14em]">
        <GoogleIcon />
        {loading === "google" ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="flex items-center gap-4 text-[0.65rem] tracking-[0.24em] uppercase text-stone-400">
        <span className="h-px flex-1 bg-stone-200" /> or <span className="h-px flex-1 bg-stone-200" />
      </div>

      {sent ? (
        <p className="rounded-sm bg-stone-100 px-4 py-4 text-sm text-stone-600">
          Check <span className="text-ink">{email}</span> — we&apos;ve sent you a secure sign-in link.
        </p>
      ) : (
        <form onSubmit={magic} className="space-y-3">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@example.com" autoComplete="email" />
          <button disabled={!!loading} className="btn btn-dark w-full">
            {loading === "email" ? "Sending…" : "Email me a sign-in link"}
          </button>
        </form>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
