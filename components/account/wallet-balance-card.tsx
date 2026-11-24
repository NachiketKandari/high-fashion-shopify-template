import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { formatPrice } from "@/lib/money";
import type { Money } from "@/lib/money/types";

import { AccountCard } from "./card";

export function WalletBalanceCard({
  balance,
  unavailable = false,
}: {
  balance: Money;
  unavailable?: boolean;
}) {
  if (unavailable) {
    return (
      <AccountCard className="grid gap-4">
        <p className="type-h4 text-ink">Account balance is unavailable</p>
        <p className="type-body-sm text-ink-muted">
          We couldn’t load your store credit right now. Please try again later.
        </p>
        <Link
          className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline underline-offset-4 hover:opacity-60"
          href="/pages/contact-us"
        >
          Contact us
        </Link>
      </AccountCard>
    );
  }

  const hasBalance = Number(balance.amount) > 0;

  return (
    <AccountCard className="grid gap-4">
      <p className="type-h4 text-ink">Available Account Balance</p>
      <p className="type-body-sm text-ink-muted">
        {hasBalance
          ? "Credit available towards future purchases"
          : "No credits are available right now."}
      </p>
      <p className="type-display text-ink tabular-nums">{formatPrice(balance)}</p>
      {hasBalance ? (
        <>
          <Button render={<Link href="/collections/all" />} size="lg">
            Shop with Account Balance
          </Button>
          <p className="type-body-sm text-ink-muted">
            Apply your balance at checkout. Any remainder can be paid using another payment method.
          </p>
        </>
      ) : (
        <>
          <p className="type-body-sm text-ink">
            Eligible cancellation and return credits will appear here once issued.
          </p>
          <Button render={<Link href="/collections/all" />} size="lg">
            Explore the Collection
          </Button>
        </>
      )}
    </AccountCard>
  );
}
