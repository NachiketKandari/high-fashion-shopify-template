import type { Metadata } from "next";
import { Suspense } from "react";

import { AccountCard } from "@/components/account/card";
import { OrderCard } from "@/components/account/order-card";
import { AccountPageHeader } from "@/components/account/page-header";
import { SummaryCard } from "@/components/account/summary-card";
import { WishlistSummaryCard } from "@/components/account/wishlist-summary-card";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getAddressName, getActiveOrderCount } from "@/lib/customer";
import type { CustomerAddress } from "@/lib/customer/types";
import { formatPrice } from "@/lib/money";
import {
  fetchCustomerAddresses,
  fetchCustomerOrders,
  fetchCustomerStoreCreditAccount,
  getCustomerProfile,
} from "@/lib/shopify/operations/customer/server";

export const metadata: Metadata = {
  title: "Overview",
};

export default function AccountOverviewPage() {
  return (
    <Suspense fallback={<AccountOverviewSkeleton />}>
      <AccountOverviewContent />
    </Suspense>
  );
}

async function AccountOverviewContent() {
  const [profile, ordersPage, addresses, storeCredit] = await Promise.all([
    getCustomerProfile(),
    fetchCustomerOrders(undefined, "/account"),
    fetchCustomerAddresses("/account"),
    fetchCustomerStoreCreditAccount("/account"),
  ]);
  const orders = ordersPage.orders;
  const activeOrders = getActiveOrderCount(orders);
  const latestOrder = orders[0];
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  const balance = storeCredit.account?.balance ?? {
    amount: "0",
    currencyCode: storeCredit.marketCurrencyCode,
  };
  const name = profile?.firstName ?? null;

  return (
    <div className="grid gap-6">
      <AccountPageHeader
        breadcrumb="Overview"
        description="Manage your orders, credits and personal details in one place."
        title={name ? `Welcome back, ${name}` : "Welcome back"}
      />

      <div className="grid gap-6 desktop:grid-cols-3">
        <SummaryCard
          action="View My Orders"
          href="/account/orders"
          label="Orders"
          value={
            activeOrders === 0
              ? "No active orders"
              : `${activeOrders} active ${activeOrders === 1 ? "order" : "orders"}`
          }
        />
        <SummaryCard
          action="Open Wallet"
          href="/account/wallet"
          label="Account Balance"
          value={storeCredit.error ? "Unavailable" : formatPrice(balance)}
        />
        <WishlistSummaryCard />
      </div>

      <section className="grid gap-6">
        <h2 className="type-h4 text-ink">Latest order</h2>
        {latestOrder ? (
          <OrderCard order={latestOrder} placedDate primaryAction />
        ) : (
          <AccountCard className="grid gap-4">
            <p className="type-h4 text-ink">No orders yet</p>
            <p className="type-body-sm text-ink-muted">
              Your latest order will appear here once you make a purchase.
            </p>
            <Link
              className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline-offset-4 hover:underline"
              href="/account/orders"
            >
              View my orders
            </Link>
          </AccountCard>
        )}
      </section>

      <AccountCard className="grid gap-4">
        <h2 className="type-h4 text-ink">Default delivery address</h2>
        {defaultAddress ? (
          <AddressSummary address={defaultAddress} />
        ) : (
          <p className="type-body-sm text-ink-muted">You have no saved addresses yet.</p>
        )}
        <Link
          className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline-offset-4 hover:underline"
          href="/account/addresses"
        >
          Manage addresses
        </Link>
      </AccountCard>

      <Link
        className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline-offset-4 hover:underline"
        href="/pages/contact-us"
      >
        Need help with an order? Contact us
      </Link>
    </div>
  );
}

function AddressSummary({ address }: { address: CustomerAddress }) {
  return (
    <address className="type-body-sm grid gap-1 text-ink-muted not-italic">
      <span>{getAddressName(address)}</span>
      {address.formatted.map((line, index) => (
        <span key={index}>{line}</span>
      ))}
    </address>
  );
}

function AccountOverviewSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-6">
      <div className="grid gap-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid gap-6 desktop:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton className="h-36 w-full rounded-none" key={index} />
        ))}
      </div>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-56 w-full rounded-none" />
      <Skeleton className="h-40 w-full rounded-none" />
    </div>
  );
}
