"use client";

import { cn } from "cn";

interface QuantityStepperProps {
  className?: string;
  disabled?: boolean;
  label: string;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  value: number;
}

export function QuantityStepper({
  className,
  disabled = false,
  label,
  max = 99,
  min = 1,
  onChange,
  value,
}: QuantityStepperProps) {
  return (
    <div aria-label={label} className={cn("flex items-center gap-4", className)} role="group">
      <button
        aria-label={`Decrease ${label}`}
        className="type-body focus-ring flex size-9 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        type="button"
      >
        -
      </button>
      <span aria-live="polite" className="type-body min-w-3 text-center tabular-nums" role="status">
        {value}
      </span>
      <button
        aria-label={`Increase ${label}`}
        className="type-body focus-ring flex size-9 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        type="button"
      >
        +
      </button>
    </div>
  );
}
