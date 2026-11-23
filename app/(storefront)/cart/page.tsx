import type { Metadata } from "next";
import { Suspense } from "react";

import { CartViewedTracker } from "@/components/analytics/trackers";
import { CartAccountBalance } from "@/components/cart/account-balance";
import { CartPageContent, CartPageSkeleton } from "@/components/cart/cart-page";
import { CartRecommendations } from "@/components/cart/recommendations";
import { CartSignIn } from "@/components/cart/sign-in";
import { Container } from "@/components/ui/container";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Cart",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CartPage() {
  return (
    <>
      <CartViewedTracker />
      <Suspense fallback={<CartPageSkeleton />}>
        <CartPageContent
          accountBalance={
            <Suspense fallback={null}>
              <CartAccountBalance />
            </Suspense>
          }
          signIn={
            <Suspense fallback={null}>
              <CartSignIn />
            </Suspense>
          }
        />
      </Suspense>
      <section aria-label="You may also like" className="pt-10 pb-10 desktop:mt-6 desktop:py-20">
        <Container className="mb-2.5 max-w-[1440px] desktop:mb-5">
          <h2 className="type-control text-ink">you may also like</h2>
        </Container>
        <CartRecommendations />
      </section>
    </>
  );
}
