"use client";

import type { CartData } from "@shopify/hydrogen";
import { Loader2 } from "lucide-react";

import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { useCart, useCheckout } from "@/lib/cart/client";

interface CartSummaryProps {
  cart: CartData;
}

export function CartSummary({ cart }: CartSummaryProps) {
  return (
    <div className="grid gap-4">
      <CartTotal cart={cart} />
      <CartCheckout label="Checkout" />
    </div>
  );
}

interface CartTotalProps {
  cart: CartData;
}

export function CartTotal({ cart }: CartTotalProps) {
  const isCostPending = useCart((state) =>
    Boolean(state.loading || state.pending.cost || state.revalidating),
  );
  const { amount, currencyCode } = cart.cost.totalAmount;
  return (
    <div
      aria-busy={isCostPending || undefined}
      aria-label="Subtotal"
      className="grid gap-1"
      role="group"
    >
      <div className="flex items-baseline justify-between text-xs tracking-wider text-foreground">
        <span>Subtotal</span>
        {isCostPending || !currencyCode ? (
          <span className="text-muted-foreground">Updating…</span>
        ) : (
          <Price amount={amount} className="text-xs tracking-wider" currencyCode={currencyCode} />
        )}
      </div>
      <p className="text-2xs text-muted-foreground">
        Tax included and shipping calculated at checkout.
      </p>
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
    isCheckingOut,
    isCheckoutDisabled,
    isUpdatingCart,
  } = useCheckout();
  return (
    <div className="grid gap-2.5">
      <Button
        aria-busy={isCheckingOut || isUpdatingCart || undefined}
        aria-describedby={checkoutError ? checkoutErrorId : undefined}
        className="h-9 w-full justify-center rounded-none border border-foreground bg-transparent text-2xs uppercase tracking-wider text-foreground shadow-none hover:bg-foreground hover:text-background"
        disabled={isCheckoutDisabled}
        onClick={handleCheckout}
        type="button"
        variant="outline"
      >
        {isCheckingOut || isUpdatingCart ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {isCheckingOut ? "Redirecting..." : isUpdatingCart ? "Updating cart..." : label}
      </Button>
      {checkoutError ? (
        <p className="text-xs text-destructive" id={checkoutErrorId} role="alert">
          {checkoutError}
        </p>
      ) : null}
    </div>
  );
}
