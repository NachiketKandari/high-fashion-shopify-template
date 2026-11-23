import type { Metadata } from "next";
import { Suspense } from "react";

import { AccountPageHeader } from "@/components/account/page-header";
import { ProfileForm } from "@/components/account/profile-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getCustomerProfile } from "@/lib/shopify/operations/customer/server";

export const metadata: Metadata = {
  title: "Profile details",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const profile = await getCustomerProfile();
  if (!profile) return null;

  return (
    <div className="grid gap-6">
      <AccountPageHeader
        breadcrumb="Profile details"
        description="Keep your contact details up to date."
        title="Profile details"
      />
      <ProfileForm profile={profile} />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-6">
      <div className="grid gap-6">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-[640px] w-full rounded-none" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-24 w-full rounded-none" />
    </div>
  );
}
