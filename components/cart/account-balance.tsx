import { unstable_rethrow } from "next/navigation";

import { Price } from "@/components/product/price";
import { Link } from "@/components/ui/link";
import { isCustomerLoggedIn } from "@/lib/auth/server";
import { fetchCustomerStoreCreditAccount } from "@/lib/shopify/operations/customer/server";

export async function CartAccountBalance() {
  if (!(await isCustomerLoggedIn())) return null;

  let storeCredit: Awaited<ReturnType<typeof fetchCustomerStoreCreditAccount>>;
  try {
    storeCredit = await fetchCustomerStoreCreditAccount("/cart");
  } catch (error) {
    unstable_rethrow(error);
    return null;
  }

  const balance = storeCredit.account?.balance;
  if (!balance || Number(balance.amount) <= 0) return null;

  return (
    <div className="grid gap-1">
      <div className="flex items-baseline justify-between gap-4">
        <span className="type-body-sm text-ink-muted">Account balance</span>
        <span className="type-body-sm text-ink">
          <Price amount={balance.amount} currencyCode={balance.currencyCode} />
        </span>
      </div>
      <p className="type-body-sm text-ink-muted">
        Applied at checkout.{" "}
        <Link className="underline underline-offset-4 hover:opacity-60" href="/account/wallet">
          View wallet
        </Link>
      </p>
    </div>
  );
}
