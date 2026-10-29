import { Star } from "lucide-react";

export function Stars({
  rating,
  size = 13,
  className = "",
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={size}
          strokeWidth={1.8}
          className={
            value <= Math.round(rating)
              ? "fill-[#C08A3E] text-[#C08A3E]"
              : "text-line"
          }
        />
      ))}
    </span>
  );
}

export function averageRating(
  items: Array<{ rating: number }>,
): { average: number; count: number } {
  if (items.length === 0) return { average: 0, count: 0 };
  const total = items.reduce((sum, item) => sum + item.rating, 0);
  return { average: total / items.length, count: items.length };
}
