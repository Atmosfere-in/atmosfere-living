"use client";

import { useState, useTransition } from "react";
import { cancelOrder } from "@/lib/actions/store";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm("Cancel this order?")) return;
          start(async () => {
            const r = await cancelOrder(orderId);
            if (!r.ok) setError(r.error);
          });
        }}
        className="btn btn-outline w-full"
      >
        {pending ? "Cancelling…" : "Cancel order"}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
