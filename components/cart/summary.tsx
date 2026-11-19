"use client";

import type { CartData } from "@shopify/hydrogen";
import { ChevronDownIcon, Loader2 } from "lucide-react";

import { useDisplayPrice } from "@/components/currency/provider";
import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { getFreeShippingStatus } from "@/lib/cart";
import { useCartMutating, useCheckout } from "@/lib/cart/client";

import { DiscountForm } from "./discount-form";

interface CartSummaryProps {
  cart: CartData;
  showCheckout?: boolean;
}

export function CartSummary({ cart, showCheckout = true }: CartSummaryProps) {
  return (
    <div className="grid gap-10">
      <div className="grid gap-8">
        <CartTotals cart={cart} />
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

function CartTotals({ cart }: { cart: CartData }) {
  const isMutating = useCartMutating();
  if (isMutating) {
    return (
      <div className="grid min-h-[102px] content-center" role="status">
        <p className="type-control text-ink">Recalculating</p>
      </div>
    );
  }
  return <CartTotal cart={cart} />;
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
        <dt className="type-nav">TOTAL</dt>
        <dd className="type-nav">
          <Price
            amount={cart.cost.totalAmount.amount}
            className="type-nav"
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
      <div aria-live="polite" className="flex items-baseline justify-between gap-8">
        <span className="type-nav">TOTAL</span>
        {isMutating ? (
          <span className="type-control" role="status">
            Recalculating
          </span>
        ) : (
          <Price
            amount={cart.cost.totalAmount.amount}
            className="type-nav"
            currencyCode={currencyCode}
          />
        )}
      </div>
      <CartCheckout />
    </aside>
  );
}
