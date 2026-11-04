"use client";

import type { ComponentProps, ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuspenseCart } from "@/lib/cart/client";

import { CartLineItems } from "./line-item";
import { CartSummary } from "./summary";
import { CartWarnings } from "./warnings";

export function CartPageContent() {
  const cart = useSuspenseCart((state) => state.data);

  if (cart.totalQuantity === 0) {
    return (
      <div className="flex flex-col items-start justify-center gap-5 px-5 py-10">
        <h2 className="text-xs uppercase tracking-wider">Your shopping cart is empty</h2>
        <Link
          href="/collections/all"
          className="inline-flex h-9 cursor-pointer items-center justify-center border border-foreground px-4 text-2xs uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          Explore collections
        </Link>
      </div>
    );
  }

  return (
    <CartPageLayout
      count={
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          ({cart.totalQuantity})
        </span>
      }
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
  const remaining = Math.max(0, 500 - Number(subtotal));
  return (
    <p className="border-t border-rule pt-2.5 text-2xs text-muted-foreground">
      {remaining === 0
        ? "Congratulations! You qualify for free shipping."
        : `You're $${remaining.toFixed(0)} away from free shipping.`}
    </p>
  );
}

export function CartPageSkeleton() {
  return (
    <CartPageLayout
      aria-busy="true"
      count={<Skeleton className="size-7 rounded-full" />}
      summary={
        <div className="grid gap-5">
          <div className="grid gap-2.5">
            <div className="flex gap-2.5">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-18 rounded-lg" />
            </div>
            <div className="grid gap-1">
              <div className="flex h-7 items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-12 rounded-lg" />
        </div>
      }
    >
      <ul className="grid gap-5">
        {[0, 1, 2].map((index) => (
          <li key={index} className="flex gap-2.5">
            <Skeleton className="size-18 shrink-0 rounded-none" />
            <div className="grid min-h-18 flex-1 gap-2.5 pt-0.5">
              <div className="grid gap-1">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-6 w-20 self-end rounded-full" />
            </div>
            <Skeleton className="h-5 w-16" />
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
    <Page {...props} className="pt-8">
      <Container>
        <div className="grid gap-8">
          <div className="flex items-center gap-2">
            <h1 className="text-lg uppercase tracking-wider">Shopping cart</h1>
            {count}
          </div>
          {warnings}
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8 xl:col-span-8">{children}</div>
            <aside className="lg:col-span-4 lg:border-l lg:border-rule lg:pl-8 xl:col-span-4">
              <div className="grid gap-4 lg:sticky lg:top-24">
                <p className="border-t border-foreground pt-3 text-2xs uppercase tracking-wider">
                  Order summary
                </p>
                {summary}
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </Page>
  );
}
