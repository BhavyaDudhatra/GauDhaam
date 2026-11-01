"use client";
import { useState } from "react";

export function StarRating({ name, defaultValue = 0 }: { name: string; defaultValue?: number }) {
  const [rating, setRating] = useState(defaultValue);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button
          type="button"
          key={n}
          onClick={() => setRating(n)}
          className="text-[22px] leading-none transition-transform"
          style={{
            color: n <= rating ? "#f59e0b" : "rgba(0,0,0,0.3)",
            transform: rating === 5 ? "scale(4)" : n <= rating ? "scale(1)" : "scale(1)",
          }}
        >
          ★
        </button>
      ))}
      <input type="hidden" name={name} value={rating} required />
    </div>
  );
}
