"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/lib/actions/store";

export function ReviewForm({ productId, slug, signedIn }: { productId: string; slug: string; signedIn: boolean }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  if (!signedIn) {
    return (
      <Link href={`/login?next=/products/${slug}%23reviews`} className="btn btn-outline">
        Sign in to write a review
      </Link>
    );
  }
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-outline">
        Write a review
      </button>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await submitReview({
            productId,
            slug,
            rating,
            title: String(fd.get("title") ?? ""),
            body: String(fd.get("body") ?? ""),
          });
          setMsg(r.ok ? { ok: true, text: r.message ?? "Thanks!" } : { ok: false, text: r.error });
        });
      }}
    >
      <div>
        <span className="label">Your rating</span>
        <div className="flex gap-1 text-accent" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button type="button" key={i} aria-label={`${i} stars`} onMouseEnter={() => setHover(i)} onClick={() => setRating(i)} className="cursor-pointer">
              <Star size={22} strokeWidth={1.2} fill={i <= (hover || rating) ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="rv-title">
          Title
        </label>
        <input id="rv-title" name="title" className="field" maxLength={80} />
      </div>
      <div>
        <label className="label" htmlFor="rv-body">
          Review
        </label>
        <textarea id="rv-body" name="body" className="field" required maxLength={1500} />
      </div>
      {msg && <p className={msg.ok ? "text-sm text-accent" : "text-sm text-red-700"}>{msg.text}</p>}
      <button disabled={pending || rating === 0} className="btn btn-dark">
        {pending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
