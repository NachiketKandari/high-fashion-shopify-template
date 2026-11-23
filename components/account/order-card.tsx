import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { getOrderAction, getOrderItemSummary, getOrderMeta } from "@/lib/customer";
import type { CustomerOrderSummary } from "@/lib/customer/types";
import { formatPrice } from "@/lib/money";

import { AccountCard } from "./card";

interface OrderCardProps {
  order: CustomerOrderSummary;
  placedDate?: boolean;
  primaryAction?: boolean;
}

export function OrderCard({ order, placedDate = false, primaryAction = false }: OrderCardProps) {
  const action = getOrderAction(order);

  return (
    <AccountCard className="grid gap-4" data-slot="account-order-card">
      <h2 className="type-h4 text-ink">Order {order.name}</h2>
      <p className="type-body-sm text-ink-muted">{getOrderMeta(order, placedDate)}</p>
      <p className="type-body-sm text-ink">{getOrderItemSummary(order)}</p>
      <div className="grid gap-3 desktop:flex desktop:items-baseline desktop:justify-between">
        <span className="type-body-sm text-ink-muted">Order total</span>
        <span className="type-body-sm text-ink tabular-nums">{formatPrice(order.totalPrice)}</span>
      </div>
      <Button
        className="w-full"
        render={
          action.external ? (
            <a href={action.href} rel="noreferrer" target="_blank" />
          ) : (
            <Link href={action.href} />
          )
        }
        size="lg"
        variant={primaryAction ? "default" : "outline"}
      >
        {action.label}
      </Button>
    </AccountCard>
  );
}
