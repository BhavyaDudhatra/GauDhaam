"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
}) {
  const small = size === "sm";
  return (
    <div
      className={`inline-flex items-center rounded-full border border-line bg-white ${
        small ? "h-8" : "h-11"
      }`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={`grid place-items-center rounded-full text-brand transition-colors hover:bg-light disabled:opacity-35 ${
          small ? "h-8 w-8" : "h-11 w-10"
        }`}
      >
        <Minus size={small ? 13 : 15} />
      </button>
      <span
        className={`text-center font-semibold tabular-nums text-brand-dark ${
          small ? "w-6 text-[12px]" : "w-8 text-[14px]"
        }`}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={`grid place-items-center rounded-full text-brand transition-colors hover:bg-light disabled:opacity-35 ${
          small ? "h-8 w-8" : "h-11 w-10"
        }`}
      >
        <Plus size={small ? 13 : 15} />
      </button>
    </div>
  );
}
