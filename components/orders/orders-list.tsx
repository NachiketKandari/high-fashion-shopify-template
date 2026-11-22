import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { CustomerOrderListRow } from "@/lib/customer/types";
import type { PageInfo } from "@/lib/pagination/types";

import { OrderCard } from "./order-card";

interface OrdersListProps {
  orders: CustomerOrderListRow[];
  pageInfo: PageInfo;
}

export function OrdersList({ orders, pageInfo }: OrdersListProps) {
  const hasPages = pageInfo.hasNextPage || pageInfo.hasPreviousPage;

  return (
    <div className="grid gap-6">
      <ul className="grid gap-6">
        {orders.map((order) => (
          <li key={order.id}>
            <OrderCard order={order} />
          </li>
        ))}
      </ul>
      <p className="type-body-sm text-ink-muted">
        Showing {orders.length} {orders.length === 1 ? "order" : "orders"}
        {pageInfo.hasNextPage ? "" : " · End of list"}
      </p>
      {hasPages ? (
        <nav aria-label="Order pages" className="flex items-center justify-between gap-4">
          {pageInfo.hasPreviousPage && pageInfo.startCursor ? (
            <Button
              className="border-ink-strong text-ink-strong"
              render={
                <Link href={`/account/orders?before=${encodeURIComponent(pageInfo.startCursor)}`} />
              }
              size="sm"
              variant="outline"
            >
              Newer
            </Button>
          ) : (
            <span />
          )}
          {pageInfo.hasNextPage && pageInfo.endCursor ? (
            <Button
              className="border-ink-strong text-ink-strong"
              render={
                <Link href={`/account/orders?after=${encodeURIComponent(pageInfo.endCursor)}`} />
              }
              size="sm"
              variant="outline"
            >
              Older
            </Button>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
