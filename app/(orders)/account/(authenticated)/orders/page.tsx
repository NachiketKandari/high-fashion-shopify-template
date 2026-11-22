import { Suspense } from "react";

import { AccountPageHeader } from "@/components/account/page-header";
import { OrdersEmpty } from "@/components/orders/orders-empty";
import { OrdersList } from "@/components/orders/orders-list";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCustomerOrders } from "@/lib/shopify/operations/customer/server";

export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ after?: string; before?: string }>;
}) {
  return (
    <div className="grid gap-6">
      <AccountPageHeader breadcrumb="Account & Wallet / My orders" title="My orders" />
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function OrdersContent({
  searchParams,
}: {
  searchParams: Promise<{ after?: string; before?: string }>;
}) {
  const params = await searchParams;
  const { orders, pageInfo } = await fetchCustomerOrders({
    after: params.after,
    before: params.before,
  });

  if (orders.length === 0) return <OrdersEmpty />;

  return <OrdersList orders={orders} pageInfo={pageInfo} />;
}

function OrdersSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton className="h-64 w-full rounded-none" key={index} />
      ))}
    </div>
  );
}
