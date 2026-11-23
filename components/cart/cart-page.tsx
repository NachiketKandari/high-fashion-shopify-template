"use client";

import { XIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartMutating, useSuspenseCart } from "@/lib/cart/client";

import { CartLineItems } from "./line-item";
import { CartMobileSummaryBar, CartSummary } from "./summary";
import { CartWarnings } from "./warnings";

const CART_WIDTH_CLASS = "max-w-[1440px]";

export function CartPageContent({
  accountBalance,
  signIn,
}: {
  accountBalance?: ReactNode;
  signIn?: ReactNode;
}) {
  const cart = useSuspenseCart((state) => state.data);
  const isMutating = useCartMutating();

  if (cart.totalQuantity === 0) {
    return <CartEmptyState />;
  }

  return (
    <>
      <Page className="pt-0">
        <Container className={CART_WIDTH_CLASS}>
          <h1 className="sr-only">Cart</h1>
          <MobileCartHeader />
          <div className="empty:hidden pb-6">
            <CartWarnings />
          </div>
          <div className="grid desktop:grid-cols-[800fr_592fr]">
            <div className="min-w-0 px-0 pt-6 pb-8 desktop:pr-10 desktop:pb-6 desktop:pl-6">
              <div className="empty:hidden mb-8 desktop:hidden">{isMutating ? null : signIn}</div>
              <CartLineItems lines={cart.lines.nodes} />
            </div>
            <aside className="min-w-0 px-0 pb-0 desktop:flex desktop:flex-col desktop:gap-10 desktop:border desktop:border-ink desktop:px-20 desktop:py-35">
              <div className="hidden empty:hidden desktop:block">{isMutating ? null : signIn}</div>
              <div className="hidden desktop:block">
                <CartSummary
                  accountBalance={accountBalance}
                  cart={cart}
                  className={
                    isMutating ? "desktop:min-h-[399px] desktop:content-center" : undefined
                  }
                  recalculating="full"
                />
              </div>
              <div className="desktop:hidden">
                <CartSummary accountBalance={accountBalance} cart={cart} showCheckout={false} />
              </div>
            </aside>
          </div>
        </Container>
      </Page>
      <CartMobileSummaryBar cart={cart} />
    </>
  );
}

function CartEmptyState() {
  return (
    <Page className="pt-0">
      <Container className={CART_WIDTH_CLASS}>
        <h1 className="sr-only">Cart</h1>
        <div className="grid justify-items-center gap-4 pt-16 pb-6 text-center desktop:py-32">
          <div className="grid gap-8">
            <h2 className="type-display">Your bag is empty</h2>
            <p className="type-body-sm max-w-[42ch] text-ink-muted">
              Start adding pieces to your bag, explore our trending picks.
            </p>
          </div>
          <div className="grid w-full max-w-[324px] grid-cols-2 gap-4">
            <Button render={<Link href="/collections/new-in" />} variant="outline">
              Exclusives
            </Button>
            <Button render={<Link href="/collections/all" />}>Trending Collection</Button>
          </div>
        </div>
      </Container>
    </Page>
  );
}

function MobileCartHeader() {
  return (
    <div className="flex h-18 items-center justify-between desktop:hidden">
      <p className="type-h3 text-ink">Cart</p>
      <Link
        aria-label="Continue shopping"
        className="focus-ring flex size-9 items-center justify-center text-ink"
        href="/"
      >
        <XIcon className="size-4" strokeWidth={1.25} />
      </Link>
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <Page aria-busy="true" className="pt-0">
      <Container className={CART_WIDTH_CLASS}>
        <div className="flex h-18 items-center justify-between desktop:hidden">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="size-9" />
        </div>
        <div className="grid desktop:grid-cols-[800fr_592fr]">
          <div className="min-w-0 px-0 pt-6 pb-8 desktop:pr-10 desktop:pb-6 desktop:pl-6">
            <ul className="grid gap-8">
              {[0, 1].map((index) => (
                <li className="flex gap-6" key={index}>
                  <Skeleton className="h-[191px] w-[123px] shrink-0" />
                  <div className="grid flex-1 content-start gap-4 py-6">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0 px-0 pb-10 desktop:border desktop:border-ink desktop:px-20 desktop:py-35">
            <div className="grid gap-10">
              <Skeleton className="h-10 w-48" />
              <div className="grid gap-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </Container>
    </Page>
  );
}
