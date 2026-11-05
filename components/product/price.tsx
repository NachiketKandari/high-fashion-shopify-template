"use client";

import { cn } from "cn";
import type { ComponentProps } from "react";

import { useDisplayPrice } from "@/components/currency/provider";

interface PriceProps extends ComponentProps<"span"> {
  amount: string;
  currencyCode: string;
}

export function Price({ amount, currencyCode, className, ...props }: PriceProps) {
  const format = useDisplayPrice();
  return (
    <span className={cn("font-light normal-case tabular-nums text-ink", className)} {...props}>
      {format({ amount, currencyCode })}
    </span>
  );
}
