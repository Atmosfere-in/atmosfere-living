import { Star } from "lucide-react";

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-accent" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} strokeWidth={1.2} fill={i <= Math.round(value) ? "currentColor" : "none"} />
      ))}
    </span>
  );
}
