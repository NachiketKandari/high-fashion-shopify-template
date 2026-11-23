import type { Metadata } from "next";
import { Suspense } from "react";

import { PaymentContent } from "@/components/checkout/payment-content";
import { PaymentSkeleton } from "@/components/checkout/payment-skeleton";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Payment",
};

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentSkeleton />}>
      <PaymentContent />
    </Suspense>
  );
}
