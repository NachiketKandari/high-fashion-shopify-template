import { getTransactionAmount, getTransactionMeta, getTransactionTitle } from "@/lib/customer";
import type { CustomerStoreCreditTransaction } from "@/lib/customer/types";

import { AccountCard } from "./card";

export function TransactionCard({ transaction }: { transaction: CustomerStoreCreditTransaction }) {
  return (
    <AccountCard className="grid gap-3">
      <p className="type-h4 text-ink">{getTransactionTitle(transaction)}</p>
      <p className="type-body-sm text-ink-muted">{getTransactionMeta(transaction)}</p>
      <div className="grid gap-3 desktop:flex desktop:items-baseline desktop:justify-between">
        <span className="type-body-sm text-ink-muted">Amount</span>
        <span className="type-body-sm text-ink tabular-nums">
          {getTransactionAmount(transaction)}
        </span>
      </div>
    </AccountCard>
  );
}
