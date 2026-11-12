"use client";

import { useTransition } from "react";
import { updateUser } from "@/lib/actions/admin";
import type { Role } from "@/lib/types";

export function UserControls({ id, role, blocked, isMe }: { id: string; role: Role; blocked: boolean; isMe: boolean }) {
  const [pending, start] = useTransition();
  const run = (patch: { role?: Role; is_blocked?: boolean }, confirmText: string) => {
    if (!confirm(confirmText)) return;
    start(async () => {
      const r = await updateUser(id, patch);
      if (!r.ok) alert(r.error);
    });
  };
  return (
    <>
      <td className="px-6 py-4">
        <select
          value={role}
          disabled={pending || isMe}
          onChange={(e) => run({ role: e.target.value as Role }, `Change this account's role to ${e.target.value}?`)}
          className="rounded border border-stone-200 bg-white px-2 py-1 text-xs capitalize"
        >
          <option value="customer">customer</option>
          <option value="admin">admin</option>
        </select>
      </td>
      <td className="px-6 py-4">
        {isMe ? (
          <span className="text-xs text-stone-400">You</span>
        ) : (
          <button
            disabled={pending}
            onClick={() => run({ is_blocked: !blocked }, blocked ? "Unblock this account?" : "Block this account? They won't be able to place orders.")}
            className={`text-xs underline cursor-pointer ${blocked ? "text-emerald-700" : "text-red-700"}`}
          >
            {blocked ? "Unblock" : "Block"}
          </button>
        )}
      </td>
    </>
  );
}
