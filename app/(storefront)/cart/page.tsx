import type { Metadata } from "next";
import { Suspense } from "react";

import { CartViewedTracker } from "@/components/analytics/trackers";
import { CartPageContent, CartPageSkeleton } from "@/components/cart/cart-page";
import { CartSignIn } from "@/components/cart/sign-in";
import { ProductRow } from "@/components/home/product-row";
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
          signIn={
            <Suspense fallback={null}>
              <CartSignIn />
            </Suspense>
          }
        />
      </Suspense>
      <section aria-label="May interest you" className="mt-14 grid gap-4">
        <Container>
          <h2 className="type-h4">May interest you</h2>
        </Container>
        <ProductRow handle="bestsellers" />
      </section>
    </>
  );
}
