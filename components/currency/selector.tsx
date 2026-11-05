"use client";

import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import { useId } from "react";

import { DISPLAY_CURRENCIES, isDisplayCurrency } from "@/lib/money/display";

import { useCurrency } from "./provider";

export function CurrencySelector({ className }: { className?: string }) {
  const id = useId();
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink",
        className,
      )}
    >
      <label className="sr-only" htmlFor={id}>
        Currency
      </label>
      <span aria-hidden="true">{currency}</span>
      <ChevronDown aria-hidden="true" className="size-3 shrink-0" strokeWidth={1.25} />
      <select
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
        data-currency-select
        id={id}
        onChange={(event) => {
          if (isDisplayCurrency(event.target.value)) setCurrency(event.target.value);
        }}
        value={currency}
      >
        {DISPLAY_CURRENCIES.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name} ({option.code})
          </option>
        ))}
      </select>
    </div>
  );
}
