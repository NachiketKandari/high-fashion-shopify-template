import type { Metadata } from "next";
import { Suspense } from "react";

import { AddressBook } from "@/components/account/address-book";
import { AccountPageHeader } from "@/components/account/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCustomerAddresses } from "@/lib/shopify/operations/customer/server";

export const metadata: Metadata = {
  title: "Saved addresses",
};

export default function AddressesPage() {
  return (
    <Suspense fallback={<AddressesSkeleton />}>
      <AddressesContent />
    </Suspense>
  );
}

async function AddressesContent() {
  const addresses = await fetchCustomerAddresses();

  return (
    <div className="grid gap-6">
      <AccountPageHeader
        breadcrumb="Saved addresses"
        description="Choose a default address or keep different destinations for future orders."
        title="Saved addresses"
      />
      <AddressBook addresses={addresses} />
    </div>
  );
}

function AddressesSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-6">
      <div className="grid gap-6">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid gap-6 desktop:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-none" />
        <Skeleton className="h-56 w-full rounded-none" />
      </div>
      <Skeleton className="h-11 w-full rounded-none" />
    </div>
  );
}
