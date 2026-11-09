"use client";

import type { ComponentProps, ReactNode } from "react";

import { useDisplayPrice } from "@/components/currency/provider";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/cart";
import { useSuspenseCart } from "@/lib/cart/client";

import { CartLineItems } from "./line-item";
import { CartSummary } from "./summary";
import { CartWarnings } from "./warnings";

export function CartPageContent() {
  const cart = useSuspenseCart((state) => state.data);

  if (cart.totalQuantity === 0) {
    return (
      <Page>
        <Container>
          <div className="grid gap-6">
            <h1 className="type-h2">Shopping cart</h1>
            <div className="grid gap-4 py-6">
              <h2 className="type-h3">Your shopping cart is empty</h2>
              <p className="type-body-sm max-w-[40ch] text-ink-muted">
                Add pieces from a collection and find them here.
              </p>
              <Link
                href="/collections/all"
                className="type-control focus-ring mt-2 inline-flex h-9 w-fit cursor-pointer items-center justify-center border border-ink px-4 text-ink transition-colors hover:bg-ink hover:text-inverse"
              >
                Explore collections
              </Link>
            </div>
          </div>
        </Container>
      </Page>
    );
  }

  return (
    <CartPageLayout
      count={<span className="type-h4 text-ink-muted">({cart.totalQuantity})</span>}
      summary={<CartSummary cart={cart} />}
      warnings={<CartWarnings />}
    >
      <div className="grid gap-5">
        <FreeShippingLine subtotal={cart.cost.subtotalAmount.amount} />
        <CartLineItems lines={cart.lines.nodes} />
      </div>
    </CartPageLayout>
  );
}

function FreeShippingLine({ subtotal }: { subtotal: string }) {
  const format = useDisplayPrice();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - Number(subtotal));
  return (
    <p className="type-label border-t border-rule pt-2.5 text-ink-muted">
      {remaining === 0
        ? "Congratulations! You qualify for free shipping."
        : `You're ${format({ amount: remaining.toFixed(2), currencyCode: "INR" })} away from free shipping.`}
    </p>
  );
}

export function CartPageSkeleton() {
  return (
    <CartPageLayout
      aria-busy="true"
      count={<Skeleton className="h-4 w-6" />}
      summary={
        <div className="grid gap-5">
          <div className="grid gap-1">
            <div className="flex h-7 items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-9" />
        </div>
      }
    >
      <ul className="grid gap-5">
        {[0, 1, 2].map((index) => (
          <li key={index} className="flex gap-3">
            <Skeleton className="h-[75px] w-15 shrink-0" />
            <div className="grid min-h-[75px] flex-1 gap-3">
              <div className="grid gap-1">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-3 w-16" />
          </li>
        ))}
      </ul>
    </CartPageLayout>
  );
}

interface CartPageLayoutProps extends ComponentProps<"div"> {
  count: ReactNode;
  summary: ReactNode;
  warnings?: ReactNode;
}

function CartPageLayout({ children, count, summary, warnings, ...props }: CartPageLayoutProps) {
  return (
    <Page {...props}>
      <Container>
        <div className="grid gap-8">
          <div className="flex items-center gap-2">
            <h1 className="type-h2">Shopping cart</h1>
            {count}
          </div>
          {warnings}
          <div className="grid gap-10 desktop:grid-cols-[minmax(0,1fr)_310px]">
            <div className="min-w-0">{children}</div>
            <aside className="desktop:border-l desktop:border-rule desktop:pl-8">
              <div className="grid gap-4 desktop:sticky desktop:top-24">
                <p className="type-label border-t border-ink pt-3">Order summary</p>
                {summary}
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </Page>
  );
}
