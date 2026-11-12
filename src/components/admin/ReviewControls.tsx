"use client";

import { useTransition } from "react";
import { deleteReview, setReviewStatus } from "@/lib/actions/admin";
import type { ReviewStatus } from "@/lib/types";

export function ReviewControls({ id, status }: { id: string; status: ReviewStatus }) {
  const [pending, start] = useTransition();
  const set = (s: ReviewStatus) => start(async () => void (await setReviewStatus(id, s)));
  return (
    <div className="flex shrink-0 gap-2">
      {status !== "approved" && (
        <button disabled={pending} onClick={() => set("approved")} className="btn !min-h-9 !px-4 bg-emerald-700 text-white hover:bg-emerald-800">
          Approve
        </button>
      )}
      {status !== "rejected" && (
        <button disabled={pending} onClick={() => set("rejected")} className="btn btn-outline !min-h-9 !px-4 bg-white">
          Reject
        </button>
      )}
      <button
        disabled={pending}
        onClick={() => confirm("Delete this review permanently?") && start(async () => void (await deleteReview(id)))}
        className="btn !min-h-9 !px-4 text-red-700 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}
