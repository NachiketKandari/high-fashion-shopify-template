import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutContent } from "@/components/checkout/checkout-content";
import { CheckoutSkeleton } from "@/components/checkout/checkout-skeleton";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Checkout",
    robots: {
      follow: false,
      index: false,
    },
  };
}

// Hydrogen redirects /checkout to Shopify's checkout, so the pre-checkout step lives one segment deeper.
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}
