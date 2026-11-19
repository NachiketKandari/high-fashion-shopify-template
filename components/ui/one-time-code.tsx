"use client";

import { cn } from "cn";
import { useRef } from "react";

interface OneTimeCodeProps {
  className?: string;
  disabled?: boolean;
  label: string;
  length?: number;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  value: string;
}

export function OneTimeCode({
  className,
  disabled = false,
  label,
  length = 6,
  onChange,
  onComplete,
  value,
}: OneTimeCodeProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  function update(next: string, index: number) {
    onChange(next);
    if (next.length === length) onComplete?.(next);
    if (next.length > index) refs.current[Math.min(index + 1, length - 1)]?.focus();
  }

  return (
    <div aria-label={label} className={cn("flex gap-2", className)} role="group">
      {digits.map((digit, index) => (
        <input
          aria-label={`${label} digit ${index + 1}`}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          className="type-body h-12 w-9 rounded-control border border-ink bg-paper text-center tabular-nums focus-ring disabled:cursor-not-allowed disabled:opacity-50 desktop:h-[49px] desktop:w-[45px]"
          disabled={disabled}
          inputMode="numeric"
          key={index}
          maxLength={1}
          onChange={(event) => {
            const character = event.target.value.replace(/\D/g, "").slice(-1);
            const next = digits.map((entry, entryIndex) =>
              entryIndex === index ? character : entry,
            );
            update(next.join(""), index);
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digit) {
              event.preventDefault();
              const next = digits.map((entry, entryIndex) =>
                entryIndex === index - 1 ? "" : entry,
              );
              onChange(next.join(""));
              refs.current[index - 1]?.focus();
            }
            if (event.key === "ArrowLeft") refs.current[index - 1]?.focus();
            if (event.key === "ArrowRight") refs.current[index + 1]?.focus();
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!pasted) return;
            onChange(pasted);
            if (pasted.length === length) onComplete?.(pasted);
            refs.current[Math.min(pasted.length, length - 1)]?.focus();
          }}
          ref={(element) => {
            refs.current[index] = element;
          }}
          type="text"
          value={digit}
        />
      ))}
    </div>
  );
}
