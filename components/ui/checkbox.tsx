"use client";

import { cn } from "cn";
import { CheckIcon } from "lucide-react";
import { useId } from "react";

interface CheckboxProps {
  checked: boolean;
  className?: string;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

export function Checkbox({
  checked,
  className,
  disabled = false,
  label,
  onCheckedChange,
}: CheckboxProps) {
  const id = useId();
  return (
    <label
      className={cn(
        "type-body-sm flex min-h-9 cursor-pointer items-center gap-3 text-ink",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      htmlFor={id}
    >
      <input
        checked={checked}
        className="peer sr-only"
        disabled={disabled}
        id={id}
        onChange={(event) => onCheckedChange(event.target.checked)}
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className="flex size-4 shrink-0 items-center justify-center rounded-control border border-ink bg-paper text-inverse peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-checked:bg-ink"
      >
        {checked ? <CheckIcon className="size-2.5" strokeWidth={2} /> : null}
      </span>
      <span>{label}</span>
    </label>
  );
}
