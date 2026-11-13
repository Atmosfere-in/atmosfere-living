"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cx } from "@/lib/utils";

type Mode = "signin" | "signup" | "forgot";

const origin = () => (typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL);

const friendly = (msg: string) => {
  if (/invalid login credentials/i.test(msg)) return "Email or password is incorrect.";
  if (/email not confirmed/i.test(msg)) return "Please confirm your email first — check your inbox for the link we sent.";
  if (/already registered|already been registered/i.test(msg)) return "An account with this email already exists. Sign in instead.";
  if (/password should be at least/i.test(msg)) return "Password must be at least 8 characters.";
  return msg;
};

export function LoginButtons({ next }: { next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callback = (to: string) => `${origin()}/auth/callback?next=${encodeURIComponent(to)}`;

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setNotice(null);
  };

  const google = async () => {
    setError(null);
    setLoading("google");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback(next), queryParams: { prompt: "select_account" } },
    });
    if (error) {
      setError(friendly(error.message));
      setLoading(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading("email");
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(null);
      if (error) return setError(friendly(error.message));
      router.replace(next);
      router.refresh();
      return;
    }

    if (mode === "signup") {
      if (password.length < 8) {
        setLoading(null);
        return setError("Password must be at least 8 characters.");
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callback(next), data: { full_name: name.trim() || undefined } },
      });
      setLoading(null);
      if (error) return setError(friendly(error.message));
      if (data.session) {
        router.replace(next);
        router.refresh();
        return;
      }
      setNotice(`Almost there — we've sent a confirmation link to ${email}. Open it to activate your account, then sign in.`);
      setMode("signin");
      setPassword("");
      return;
    }

    // forgot password
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback("/account/password?reset=1") });
    setLoading(null);
    if (error) return setError(friendly(error.message));
    setNotice(`If an account exists for ${email}, we've emailed a link to reset your password.`);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={google}
        disabled={!!loading}
        className="btn w-full border border-stone-200 bg-white text-ink hover:border-ink !tracking-[0.14em]"
      >
        <GoogleIcon />
        {loading === "google" ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="flex items-center gap-4 text-[0.65rem] tracking-[0.24em] uppercase text-stone-400">
        <span className="h-px flex-1 bg-stone-200" /> or <span className="h-px flex-1 bg-stone-200" />
      </div>

      {mode !== "forgot" && (
        <div className="grid grid-cols-2 rounded-full border border-stone-200 p-1 text-[0.68rem] tracking-[0.18em] uppercase">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={cx("rounded-full py-2 cursor-pointer transition-colors", mode === m ? "bg-charcoal text-ivory" : "text-stone-600 hover:text-ink")}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        {mode === "forgot" && (
          <p className="text-sm text-stone-600">Enter your email and we&apos;ll send you a link to set a new password.</p>
        )}
        {mode === "signup" && (
          <div>
            <label className="label" htmlFor="name">
              Full name
            </label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="field" autoComplete="name" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        {mode !== "forgot" && (
          <div>
            <div className="flex items-baseline justify-between">
              <label className="label" htmlFor="password">
                Password
              </label>
              {mode === "signin" && (
                <button type="button" onClick={() => switchMode("forgot")} className="text-xs text-stone-600 underline hover:text-ink cursor-pointer">
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                required
                minLength={mode === "signup" ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field pr-16"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-600 cursor-pointer"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            {mode === "signup" && <p className="mt-1 text-xs text-stone-400">At least 8 characters.</p>}
          </div>
        )}

        <button disabled={!!loading} className="btn btn-dark w-full">
          {loading === "email"
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in"
              : mode === "signup"
                ? "Create account"
                : "Send reset link"}
        </button>
        {mode === "forgot" && (
          <button type="button" onClick={() => switchMode("signin")} className="block w-full text-center text-xs text-stone-600 underline cursor-pointer">
            Back to sign in
          </button>
        )}
      </form>

      {notice && <p className="rounded-sm bg-stone-100 px-4 py-3 text-sm text-stone-600">{notice}</p>}
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
