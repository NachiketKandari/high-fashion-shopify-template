"use client";

import type { CartData } from "@shopify/hydrogen";
import { Loader2 } from "lucide-react";

import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { useCart, useCheckout } from "@/lib/cart/client";

import { DiscountForm } from "./discount-form";

interface CartSummaryProps {
  cart: CartData;
}

export function CartSummary({ cart }: CartSummaryProps) {
  return (
    <div className="grid gap-4">
      <CartTotal cart={cart} />
      <CartCheckout label="Checkout" />
      <details className="group">
        <summary className="type-control focus-ring flex h-9 cursor-pointer list-none items-center underline underline-offset-4 [&::-webkit-details-marker]:hidden">
          Discount code
        </summary>
        <div className="mt-3">
          <DiscountForm cart={cart} />
        </div>
      </details>
    </div>
  );
}

interface CartTotalProps {
  cart: CartData;
}

export function CartTotal({ cart }: CartTotalProps) {
  const isCostPending = useCart((state) =>
    Boolean(state.pending.cost || state.pending.lines.size > 0 || state.revalidating),
  );
  const currencyCode =
    cart.cost.subtotalAmount.currencyCode ||
    cart.cost.totalAmount.currencyCode ||
    cart.lines.nodes[0]?.cost.totalAmount.currencyCode;
  const optimisticAmount = cart.lines.nodes.reduce(
    (total, line) => total + Number(line.cost.amountPerQuantity.amount) * line.quantity,
    0,
  );
  const amount =
    isCostPending && optimisticAmount > 0 ? String(optimisticAmount) : cart.cost.totalAmount.amount;
  return (
    <div
      aria-busy={isCostPending || undefined}
      aria-label="Subtotal"
      className="grid gap-1"
      role="group"
    >
      <div className="type-h4 flex items-baseline justify-between text-ink">
        <span>Subtotal</span>
        {currencyCode ? (
          <Price amount={amount} className="type-h4 font-normal" currencyCode={currencyCode} />
        ) : (
          <span className="text-ink-muted">Updating…</span>
        )}
      </div>
      <p className="type-label text-ink-muted">Tax included and shipping calculated at checkout.</p>
    </div>
  );
}

interface CartCheckoutProps {
  label?: string;
}

export function CartCheckout({ label = "Checkout" }: CartCheckoutProps) {
  const {
    checkoutError,
    checkoutErrorId,
    handleCheckout,
    isCartMutating,
    isCheckingOut,
    isCheckoutDisabled,
  } = useCheckout();
  return (
    <div className="grid gap-2.5">
      <Button
        aria-busy={isCheckingOut || isCartMutating || undefined}
        aria-describedby={checkoutError ? checkoutErrorId : undefined}
        className="h-9 w-full justify-center"
        disabled={isCheckoutDisabled}
        onClick={handleCheckout}
        type="button"
        variant="outline"
      >
        {isCheckingOut ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {isCheckingOut ? "Redirecting..." : label}
      </Button>
      {checkoutError ? (
        <p className="type-body-sm text-error-rule" id={checkoutErrorId} role="alert">
          {checkoutError}
        </p>
      ) : null}
    </div>
  );
}
