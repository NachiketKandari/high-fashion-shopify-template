import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TrackingPage } from "@/components/orders/tracking-page";
import { TrackingSkeleton } from "@/components/orders/tracking-skeleton";
import { requireCustomerSession } from "@/lib/auth/server";
import { buildOrderTrackingView } from "@/lib/orders";
import { fetchCustomerOrder, getCustomerProfile } from "@/lib/shopify/operations/customer/server";

export const metadata: Metadata = {
  title: "Order tracking",
  robots: { index: false, follow: false },
};

export default function OrderTrackingRoute({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<TrackingSkeleton />}>
      <OrderTrackingContent params={params} />
    </Suspense>
  );
}

async function OrderTrackingContent({ params }: { params: Promise<{ id: string }> }) {
  await requireCustomerSession();
  const { id } = await params;
  if (!id) notFound();
  // Dynamic segments arrive percent-encoded; the Customer Account API needs the raw GID.
  const orderId = decodeURIComponent(id);

  const [order, profile] = await Promise.all([fetchCustomerOrder(orderId), getCustomerProfile()]);
  if (!order) notFound();

  return (
    <TrackingPage
      email={profile?.email ?? null}
      order={order}
      view={buildOrderTrackingView(order)}
    />
  );
}
