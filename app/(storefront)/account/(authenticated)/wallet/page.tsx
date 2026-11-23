import type { Metadata } from "next";
import { Suspense } from "react";

import { AccountCard } from "@/components/account/card";
import { AccountPageHeader } from "@/components/account/page-header";
import { TransactionCard } from "@/components/account/transaction-card";
import { WalletBalanceCard } from "@/components/account/wallet-balance-card";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCustomerStoreCreditAccount } from "@/lib/shopify/operations/customer/server";

export const metadata: Metadata = {
  title: "Account Balance",
};

export default function WalletPage() {
  return (
    <Suspense fallback={<WalletSkeleton />}>
      <WalletContent />
    </Suspense>
  );
}

async function WalletContent() {
  const storeCredit = await fetchCustomerStoreCreditAccount();
  const balance = storeCredit.account?.balance ?? {
    amount: "0",
    currencyCode: storeCredit.marketCurrencyCode,
  };
  const transactions = storeCredit.account?.transactions ?? [];

  return (
    <div className="grid gap-6">
      <AccountPageHeader breadcrumb="Account Balance" title="Account Balance" />
      <WalletBalanceCard balance={balance} unavailable={storeCredit.error} />

      {storeCredit.error ? null : (
        <>
          <section className="grid gap-6">
            <h2 className="type-h4 text-ink">Transaction history</h2>
            {transactions.length === 0 ? (
              <AccountCard className="grid gap-4">
                <p className="type-h4 text-ink">No wallet activity yet</p>
                <p className="type-body-sm text-ink-muted">
                  Credits and purchases made with Account Balance will be listed here.
                </p>
              </AccountCard>
            ) : (
              <ul className="grid gap-6">
                {transactions.map((transaction) => (
                  <li
                    key={`${transaction.createdAt}-${transaction.event}-${transaction.amount.amount}`}
                  >
                    <TransactionCard transaction={transaction} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {transactions.length === 0 ? (
            <Link
              className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline-offset-4 hover:underline"
              href="/pages/contact-us"
            >
              Have a question about a credit? Contact us
            </Link>
          ) : (
            <div className="grid gap-3">
              <p className="type-body-sm text-ink-muted">
                Pending returns are not included in the available balance.
              </p>
              <Link
                className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline-offset-4 hover:underline"
                href="/account/invoices"
              >
                View credit notes
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function WalletSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-6">
      <div className="grid gap-6">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-60 w-full rounded-none" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-32 w-full rounded-none" />
      <Skeleton className="h-32 w-full rounded-none" />
    </div>
  );
}
