import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { CustomerOrderListRow } from "@/lib/customer/types";
import { formatPrice } from "@/lib/money";
import {
  formatOrderDate,
  getOrderDeliveredAt,
  getOrderItemSummary,
  getOrderStage,
  getOrderStageLabel,
} from "@/lib/orders";

export function OrderCard({ order }: { order: CustomerOrderListRow }) {
  const stage = getOrderStage(order);
  const deliveredAt = getOrderDeliveredAt(order);
  const meta = `${formatOrderDate(order.processedAt)} · ${getOrderStageLabel(stage)}`;
  const itemSummary = [
    getOrderItemSummary(order),
    stage === "delivered" && deliveredAt ? `Delivered ${formatOrderDate(deliveredAt)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="grid gap-4 border border-ink-strong p-6">
      <div className="grid gap-1">
        <h2 className="type-h4 text-ink-strong">{order.name}</h2>
        <p className="type-body-sm text-ink-muted">{meta}</p>
      </div>
      <p className="type-body-sm text-ink-strong">{itemSummary}</p>
      <div className="flex flex-col gap-1 desktop:flex-row desktop:items-baseline desktop:justify-between">
        <span className="type-body-sm text-ink-muted">Order total</span>
        <span className="type-body-sm text-ink-strong">{formatPrice(order.totalPrice)}</span>
      </div>
      <Button
        className="h-12 w-full border-ink-strong text-ink-strong"
        render={<Link href={`/account/orders/${encodeURIComponent(order.id)}`} />}
        variant="outline"
      >
        {stage === "cancelled" ? "View Order" : "Track Order"}
      </Button>
    </article>
  );
}
