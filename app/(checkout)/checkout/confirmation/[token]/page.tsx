import type { Metadata } from "next";
import { Suspense } from "react";

import { ConfirmationContent } from "@/components/checkout/confirmation-content";
import { ConfirmationSkeleton } from "@/components/checkout/confirmation-skeleton";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Order confirmation",
};

interface ConfirmationPageProps {
  params: Promise<{ token: string }>;
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  return (
    <Suspense fallback={<ConfirmationSkeleton />}>
      <ConfirmationContent params={params} />
    </Suspense>
  );
}
