"use client";

import { cn } from "cn";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { useCart, useCartForm } from "@/lib/cart/client";
import type { Cart } from "@/lib/cart/types";

interface PromoCodeProps {
  cart: Cart;
  className?: string;
}

export function PromoCode({ cart, className }: PromoCodeProps) {
  const { formProps, register } = useCartForm();
  const discountErrors = useCart((state) => state.errors.discountCodes);
  const pendingCodes = useCart((state) => state.pending.discountCodes);
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const isPending = pendingCodes.size > 0;
  const error =
    localError ??
    Array.from(discountErrors.values()).flatMap((group) => [
      ...group.userErrors,
      ...group.warnings,
    ])[0]?.message ??
    null;

  return (
    <details className={cn("group", className)}>
      <summary className="type-meta flex h-12 cursor-pointer list-none items-center justify-between gap-4 text-ink-strong [&::-webkit-details-marker]:hidden">
        Do you have a promotional code?
        <ChevronDownIcon
          aria-hidden="true"
          className="size-3 shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>

      <div className="grid gap-2 pt-2">
        {cart.discountCodes.length > 0 ? (
          <ul aria-label="Applied promotional codes" className="grid gap-2">
            {cart.discountCodes.map((discount) => {
              const isCodePending = pendingCodes.has(discount.code);
              return (
                <li
                  className="flex min-h-16 items-center justify-between gap-4 border border-ink px-4"
                  key={discount.code}
                >
                  <span className="type-meta">{discount.code}</span>
                  <div className="flex items-center gap-3">
                    {!discount.applicable && !isCodePending ? (
                      <span className="type-meta text-ink-muted">Invalid code</span>
                    ) : null}
                    <form {...formProps({ beforeSubmit: () => setLocalError(null) })}>
                      <input
                        type="hidden"
                        {...register("discountCode", { value: discount.code })}
                      />
                      <button
                        {...register("discount-remove")}
                        aria-label={`Remove promotional code ${discount.code}`}
                        className="focus-ring flex size-9 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={isCodePending}
                        type="submit"
                      >
                        <XIcon aria-hidden="true" className="size-3" />
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <form
            className="flex gap-2"
            {...formProps({
              afterSubmit: () => setCode(""),
              beforeSubmit: (event) => {
                const normalized = code.trim().toUpperCase();
                if (!normalized) {
                  event.preventDefault();
                  setLocalError("Enter a promotional code");
                  return;
                }
                const input = event.currentTarget.elements.namedItem("discountCode");
                if (input instanceof HTMLInputElement) input.value = normalized;
                setLocalError(null);
              },
            })}
          >
            <Input
              aria-label="Promotional code"
              aria-invalid={error ? true : undefined}
              autoComplete="off"
              className="type-meta-medium h-10 flex-1 scroll-mt-6 border-ink px-4 uppercase focus-none focus-visible:border-2"
              disabled={isPending}
              onChange={(event) => {
                setCode(event.target.value);
                if (localError) setLocalError(null);
              }}
              placeholder="Promotional code"
              spellCheck={false}
              type="text"
              {...register("discountCode", { value: code })}
            />
            <button
              {...register("discount-apply")}
              className="type-meta-medium focus-ring h-10 shrink-0 cursor-pointer border border-ink px-6 transition-colors hover:bg-ink hover:text-inverse disabled:cursor-not-allowed disabled:opacity-40"
              disabled={isPending}
              type="submit"
            >
              Apply
            </button>
          </form>
        )}

        {error ? (
          <p className="type-meta text-error-rule" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </details>
  );
}
