import { Price } from "@/components/product/price";
import { Link } from "@/components/ui/link";
import type { Money } from "@/lib/money/types";
import type { ReturnEstimate } from "@/lib/returns/types";

interface ReturnSummaryProps {
  amountLabel?: string;
  estimate: ReturnEstimate | null;
  estimateMessage?: string;
  item: { options: string; quantity: number; title: string } | null;
  orderName: string;
  otherItems?: { count: number; total: Money | null } | null;
  policyCopy?: string;
  request?: { name: string; status: string } | null;
}

function hasAmount(money: Money): boolean {
  return Number(money.amount) > 0;
}

export function ReturnSummary({
  amountLabel = "Estimated return value",
  estimate,
  estimateMessage,
  item,
  orderName,
  otherItems,
  policyCopy = "Final acceptance and settlement are confirmed after the item is received and checked. Unselected items are not affected.",
  request,
}: ReturnSummaryProps) {
  return (
    <div className="grid gap-6">
      <h2 className="type-label text-ink">REQUEST SUMMARY</h2>
      <div className="border-t border-rule" />
      <p className="type-body-sm text-ink-muted">Order reference: {orderName}</p>

      {item ? (
        <div className="grid gap-2">
          <p className="type-control text-ink">{item.title}</p>
          <p className="type-body-sm text-ink-muted">
            {item.options ? `${item.options} · ` : ""}Qty {item.quantity}
          </p>
        </div>
      ) : null}

      <div className="border-t border-rule" />

      {estimate ? (
        <dl className="grid gap-6">
          <div className="flex items-baseline justify-between gap-6">
            <dt className="type-body-sm">Selected item</dt>
            <dd className="type-body-sm">
              <Price amount={estimate.subtotal.amount} currencyCode={estimate.currencyCode} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6">
            <dt className="type-body-sm">Item tax</dt>
            <dd className="type-body-sm">
              <Price amount={estimate.tax.amount} currencyCode={estimate.currencyCode} />
            </dd>
          </div>
          {hasAmount(estimate.returnShippingFee) ? (
            <div className="flex items-baseline justify-between gap-6">
              <dt className="type-body-sm">Return shipping</dt>
              <dd className="type-body-sm">
                −{" "}
                <Price
                  amount={estimate.returnShippingFee.amount}
                  currencyCode={estimate.currencyCode}
                />
              </dd>
            </div>
          ) : null}
          {hasAmount(estimate.restockingFee) ? (
            <div className="flex items-baseline justify-between gap-6">
              <dt className="type-body-sm">Restocking fee</dt>
              <dd className="type-body-sm">
                −{" "}
                <Price
                  amount={estimate.restockingFee.amount}
                  currencyCode={estimate.currencyCode}
                />
              </dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between gap-6">
            <dt className="type-body">{amountLabel}</dt>
            <dd className="type-body">
              <Price amount={estimate.total.amount} currencyCode={estimate.currencyCode} />
            </dd>
          </div>
        </dl>
      ) : (
        <p className="type-body-sm text-ink-muted">
          {estimateMessage ?? "Select an item to see its estimated return value."}
        </p>
      )}

      {otherItems && otherItems.count > 0 ? (
        <p className="type-body-sm text-ink-muted">
          {otherItems.count} other {otherItems.count === 1 ? "item stays" : "items stay"} with you
          {otherItems.total ? (
            <>
              {" · "}
              <Price
                amount={otherItems.total.amount}
                currencyCode={otherItems.total.currencyCode}
              />
            </>
          ) : null}
        </p>
      ) : null}

      <div className="border-t border-rule" />

      <div className="grid gap-3">
        <p className="type-body">Return subject to inspection</p>
        <p className="type-body-sm text-ink-muted">{policyCopy}</p>
      </div>

      <Link
        className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink hover:underline"
        href="/pages/contact-us"
      >
        Need help? Contact concierge
      </Link>

      {request ? (
        <div className="grid gap-2 border-t border-rule pt-6">
          <p className="type-body-sm text-ink">Request reference: {request.name}</p>
          <p className="type-body-sm text-ink-muted">Status: {request.status}</p>
        </div>
      ) : null}
    </div>
  );
}
