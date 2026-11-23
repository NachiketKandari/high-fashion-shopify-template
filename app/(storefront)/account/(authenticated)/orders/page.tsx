import type { Metadata } from "next";
import { Suspense } from "react";

import { OrdersEmptyState } from "@/components/account/orders-empty-state";
import { OrdersList } from "@/components/account/orders-list";
import { AccountPageHeader } from "@/components/account/page-header";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCustomerOrders } from "@/lib/shopify/operations/customer/server";

export const metadata: Metadata = {
  title: "My orders",
};

export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ after?: string; before?: string }>;
}) {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}

async function OrdersContent({
  searchParams,
}: {
  searchParams: Promise<{ after?: string; before?: string }>;
}) {
  const params = await searchParams;
  const page = await fetchCustomerOrders({ after: params.after, before: params.before });
  const orders = page.orders;
  const newerHref =
    page.pageInfo.hasPreviousPage && page.pageInfo.startCursor
      ? `/account/orders?before=${encodeURIComponent(page.pageInfo.startCursor)}`
      : null;
  const olderHref =
    page.pageInfo.hasNextPage && page.pageInfo.endCursor
      ? `/account/orders?after=${encodeURIComponent(page.pageInfo.endCursor)}`
      : null;

  if (orders.length === 0) {
    if (params.after || params.before) {
      return (
        <div className="grid gap-6">
          <AccountPageHeader breadcrumb="My orders" title="My orders" />
          <p className="type-body-sm text-ink-muted">No orders on this page.</p>
          <Link
            className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline-offset-4 hover:underline"
            href="/account/orders"
          >
            Back to my orders
          </Link>
        </div>
      );
    }

    return (
      <div className="grid gap-6">
        <AccountPageHeader
          breadcrumb="My orders"
          description="Your orders will appear here after your first purchase."
          title="My orders"
        />
        <OrdersEmptyState />
        <Link
          className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline-offset-4 hover:underline"
          href="/pages/contact-us"
        >
          Need help finding an order? Contact us
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <AccountPageHeader breadcrumb="My orders" title="My orders" />
      <OrdersList
        newerHref={newerHref}
        olderHref={olderHref}
        orders={orders}
        pageInfo={page.pageInfo}
      />
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-6">
      <div className="grid gap-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="grid gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full rounded-none" />
      </div>
      <div className="grid gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton className="h-64 w-full rounded-none" key={index} />
        ))}
      </div>
    </div>
  );
}
