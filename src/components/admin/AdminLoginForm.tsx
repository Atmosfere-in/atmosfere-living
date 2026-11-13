"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm({ next, signedIn }: { next: string; signedIn: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // A signed-in customer landing here is signed out, so the admin form starts clean.
  useEffect(() => {
    if (signedIn) void createClient().auth.signOut().then(() => router.refresh());
  }, [signedIn, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setLoading(false);
      return setError(/invalid login credentials/i.test(error?.message ?? "") ? "Email or password is incorrect." : error?.message ?? "Sign in failed.");
    }

    const { data: profile } = await supabase.from("profiles").select("role, is_blocked").eq("id", data.user.id).maybeSingle();
    if (profile?.role !== "admin" || profile.is_blocked) {
      await supabase.auth.signOut();
      setLoading(false);
      return setError("This account doesn't have admin access.");
    }

    router.replace(next);
    router.refresh();
  };

  const forgot = async () => {
    setError(null);
    if (!email) return setError("Enter your admin email first, then click “Forgot password?”.");
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/account/password?reset=1")}`,
    });
    if (error) return setError(error.message);
    setNotice(`If ${email} is an account, a password reset link is on its way.`);
  };

  const field =
    "w-full min-h-12 rounded-sm border border-ivory/15 bg-ivory/5 px-4 py-3 text-ivory placeholder:text-ivory/30 outline-none focus:border-accent";

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="label !text-ivory/60" htmlFor="admin-email">
          Email
        </label>
        <input id="admin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} autoComplete="username" />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label className="label !text-ivory/60" htmlFor="admin-password">
            Password
          </label>
          <button type="button" onClick={forgot} className="text-xs text-ivory/50 underline hover:text-ivory cursor-pointer">
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            id="admin-password"
            type={showPw ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${field} pr-16`}
            autoComplete="current-password"
          />
          <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ivory/50 cursor-pointer">
            {showPw ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {notice && <p className="text-sm text-ivory/70">{notice}</p>}
      <button disabled={loading} className="btn btn-light w-full">
        {loading ? "Signing in…" : "Sign in to admin"}
      </button>
    </form>
  );
}
