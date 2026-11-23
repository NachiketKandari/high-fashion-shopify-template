"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { Link } from "@/components/ui/link";
import { getOpenReturn } from "@/lib/customer";
import type { CustomerOrderSummary } from "@/lib/customer/types";
import type { PageInfo } from "@/lib/pagination/types";

import { OrderCard } from "./order-card";

type OrderFilter = "all" | "fulfilled" | "preparing" | "returns";

const FILTERS: { label: string; value: OrderFilter }[] = [
  { label: "All orders", value: "all" },
  { label: "Preparing", value: "preparing" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Returns", value: "returns" },
];

interface OrdersListProps {
  newerHref: string | null;
  olderHref: string | null;
  orders: CustomerOrderSummary[];
  pageInfo: PageInfo;
}

export function OrdersList({ newerHref, olderHref, orders, pageInfo }: OrdersListProps) {
  const [filter, setFilter] = useState<OrderFilter>("all");
  const filteredOrders = orders.filter((order) => matchesFilter(order, filter));
  const countLabel = `Showing ${filteredOrders.length} ${
    filteredOrders.length === 1 ? "order" : "orders"
  }`;
  const atEnd = !pageInfo.hasNextPage && !pageInfo.hasPreviousPage;

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <label className="type-body-sm text-ink" htmlFor="order-filter">
          Filter orders
        </label>
        <div className="relative">
          <select
            className="type-body-sm focus-ring h-11 w-full appearance-none border border-input bg-paper px-3 pr-9 text-ink"
            id="order-filter"
            onChange={(event) => setFilter(event.target.value as OrderFilter)}
            value={filter}
          >
            {FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-ink-muted"
            strokeWidth={1.25}
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="grid justify-items-start gap-4 border border-rule p-6">
          <p className="type-body-sm text-ink-muted">No orders match this filter.</p>
          <button
            className="type-body-sm focus-ring min-h-9 cursor-pointer text-ink underline underline-offset-4"
            onClick={() => setFilter("all")}
            type="button"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <ul className="grid gap-6">
          {filteredOrders.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3">
        <p className="type-body-sm text-ink-muted">
          {countLabel}
          {atEnd ? " · End of list" : null}
        </p>
        {newerHref || olderHref ? (
          <div className="flex items-center gap-6">
            {newerHref ? (
              <Link
                className="type-body-sm focus-ring inline-flex min-h-9 items-center text-ink underline-offset-4 hover:underline"
                href={newerHref}
              >
                Newer orders
              </Link>
            ) : null}
            {olderHref ? (
              <Link
                className="type-body-sm focus-ring inline-flex min-h-9 items-center text-ink underline-offset-4 hover:underline"
                href={olderHref}
              >
                Older orders
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function matchesFilter(order: CustomerOrderSummary, filter: OrderFilter): boolean {
  if (filter === "all") return true;
  if (filter === "returns") return order.returns.length > 0;
  if (filter === "fulfilled") return order.fulfillmentStatus === "FULFILLED";
  return order.fulfillmentStatus !== "FULFILLED" && !getOpenReturn(order.returns);
}
