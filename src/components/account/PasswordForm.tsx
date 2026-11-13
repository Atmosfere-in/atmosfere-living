"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (password.length < 8) return setMsg({ ok: false, text: "Password must be at least 8 characters." });
    if (password !== confirm) return setMsg({ ok: false, text: "Passwords don't match." });
    setPending(true);
    const { error } = await createClient().auth.updateUser({ password });
    setPending(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setPassword("");
    setConfirm("");
    setMsg({ ok: true, text: "Password updated. You can now sign in with your email and this password." });
  };

  return (
    <form onSubmit={submit} className="card space-y-5 p-6">
      <div>
        <label className="label" htmlFor="new-password">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="label" htmlFor="confirm-password">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="field"
          autoComplete="new-password"
        />
      </div>
      {msg && <p className={msg.ok ? "text-sm text-accent" : "text-sm text-red-700"}>{msg.text}</p>}
      <button disabled={pending} className="btn btn-dark">
        {pending ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
