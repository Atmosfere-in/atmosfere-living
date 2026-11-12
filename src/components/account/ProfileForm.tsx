"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/store";

export function ProfileForm({ fullName, phone }: { fullName: string; phone: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="card space-y-5 p-6"
      action={(fd) =>
        start(async () => {
          const r = await updateProfile(fd);
          setMsg(r.ok ? { ok: true, text: r.message ?? "Saved." } : { ok: false, text: r.error });
        })
      }
    >
      <div>
        <label className="label" htmlFor="full_name">
          Full name
        </label>
        <input id="full_name" name="full_name" defaultValue={fullName} className="field" autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="phone">
          Phone
        </label>
        <input id="phone" name="phone" defaultValue={phone} className="field" type="tel" autoComplete="tel" />
      </div>
      {msg && <p className={msg.ok ? "text-sm text-accent" : "text-sm text-red-700"}>{msg.text}</p>}
      <button disabled={pending} className="btn btn-dark">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
