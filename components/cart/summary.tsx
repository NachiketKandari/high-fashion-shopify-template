"use client";

import type { CartData } from "@shopify/hydrogen";
import { cn } from "cn";
import { ChevronDownIcon, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { useDisplayPrice } from "@/components/currency/provider";
import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { getFreeShippingStatus } from "@/lib/cart";
import { useCartMutating, useCheckout } from "@/lib/cart/client";

import { DiscountForm } from "./discount-form";

interface CartSummaryProps {
  accountBalance?: ReactNode;
  cart: CartData;
  className?: string;
  recalculating?: "full" | "totals";
  showCheckout?: boolean;
}

export function CartSummary({
  accountBalance,
  cart,
  className,
  recalculating = "totals",
  showCheckout = true,
}: CartSummaryProps) {
  const isMutating = useCartMutating();

  if (isMutating && recalculating === "full") {
    return (
      <div className={cn("grid justify-items-center gap-2.5 text-center", className)} role="status">
        <Loader2
          aria-hidden="true"
          className="size-6 animate-spin motion-reduce:animate-none desktop:size-8"
          strokeWidth={1.5}
        />
        <p className="type-meta-semibold text-ink">Recalculating</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-10", className)}>
      <div className="grid gap-8">
        {accountBalance ? <div className="border-b border-rule pb-6">{accountBalance}</div> : null}
        {isMutating ? <CartTotalsRecalculating /> : <CartTotal cart={cart} />}
        {showCheckout ? <CartCheckout /> : null}
      </div>
      <PromoDisclosure cart={cart} />
      <Link
        className="type-control focus-ring hidden w-fit text-ink-muted underline underline-offset-4 desktop:flex"
        href="/pages/contact-us"
      >
        need help? contact us
      </Link>
    </div>
  );
}

function CartTotalsRecalculating() {
  return (
    <div className="grid min-h-[102px] content-center" role="status">
      <p className="type-meta-semibold inline-flex items-center gap-2.5 text-ink">
        <Loader2
          aria-hidden="true"
          className="size-4 animate-spin motion-reduce:animate-none"
          strokeWidth={1.5}
        />
        Recalculating
      </p>
    </div>
  );
}

export function CartTotal({ cart }: { cart: CartData }) {
  const format = useDisplayPrice();
  const currencyCode = cart.cost.subtotalAmount.currencyCode;
  const { remaining } = getFreeShippingStatus(
    cart.cost.subtotalAmount.amount,
    currencyCode,
    format,
  );
  return (
    <dl className="grid gap-6">
      <div className="flex items-baseline justify-between gap-8">
        <dt className="type-h4">Subtotal</dt>
        <dd className="type-h4">
          <Price
            amount={cart.cost.subtotalAmount.amount}
            className="type-h4"
            currencyCode={currencyCode}
          />
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-8">
        <dt className="type-h4">Delivery</dt>
        <dd className="type-h4">{remaining === 0 ? "Free" : "Calculated at checkout"}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-8">
        <dt className="type-tab-active">TOTAL</dt>
        <dd className="type-tab-active">
          <Price
            amount={cart.cost.totalAmount.amount}
            className="type-tab-active"
            currencyCode={cart.cost.totalAmount.currencyCode || currencyCode}
          />
        </dd>
      </div>
    </dl>
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
        className="w-full"
        disabled={isCheckoutDisabled}
        onClick={handleCheckout}
      >
        {isCheckingOut ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
        {label}
      </Button>
      {checkoutError ? (
        <p className="type-body-sm text-error" id={checkoutErrorId} role="alert">
          {checkoutError}
        </p>
      ) : null}
    </div>
  );
}

function PromoDisclosure({ cart }: { cart: CartData }) {
  return (
    <details className="group">
      <summary className="type-body-sm focus-ring flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
        <span>Do you have a promotional code?</span>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-3 shrink-0 transition-transform duration-(--motion-base) group-open:rotate-180"
          strokeWidth={1.25}
        />
      </summary>
      <div className="pb-4">
        <DiscountForm cart={cart} />
      </div>
    </details>
  );
}

export function CartMobileSummaryBar({ cart }: { cart: CartData }) {
  const isMutating = useCartMutating();
  const currencyCode = cart.cost.totalAmount.currencyCode || cart.cost.subtotalAmount.currencyCode;
  return (
    <aside
      aria-label="Cart summary"
      className="fixed inset-x-0 bottom-0 z-(--z-header) grid gap-6 border-t border-ink bg-paper px-(--gutter) pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] desktop:hidden"
    >
      <div aria-live="polite" className="flex items-center justify-between gap-8">
        <span className="type-tab-active">TOTAL</span>
        {isMutating ? (
          <span className="type-meta-semibold inline-flex items-center gap-2.5" role="status">
            <Loader2
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
              strokeWidth={1.5}
            />
            Recalculating
          </span>
        ) : (
          <Price
            amount={cart.cost.totalAmount.amount}
            className="type-tab-active"
            currencyCode={currencyCode}
          />
        )}
      </div>
      <CartCheckout />
    </aside>
  );
}
