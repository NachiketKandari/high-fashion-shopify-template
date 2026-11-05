import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { AccountMobileTabs } from "@/components/account/mobile-tabs";
import { AccountSidebar } from "@/components/account/sidebar";
import { SignOutButton } from "@/components/account/sign-out-button";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { Skeleton } from "@/components/ui/skeleton";
import { getCustomerAccessToken, requireCustomerSession } from "@/lib/auth/server";
import { shopConfig } from "@/lib/config";
import { getCustomerProfile } from "@/lib/shopify/operations/customer/server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Account",
    robots: { index: false, follow: false },
  };
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <Page className="flex flex-1 flex-col">
      <Container className="flex flex-1 flex-col gap-6 desktop:flex-row desktop:gap-10">
        <aside className="hidden w-52 shrink-0 desktop:block">
          <div className="sticky top-24 flex flex-col gap-6">
            <Suspense fallback={<AccountLabelSkeleton />}>
              <AccountLabel />
            </Suspense>
            <Suspense fallback={<SidebarSkeleton />}>
              <AccountSidebar />
            </Suspense>
            <SignOutButton />
          </div>
        </aside>

        <div className="flex flex-1 flex-col min-w-0">
          <div className="mb-4 flex items-center justify-between desktop:hidden">
            <Suspense fallback={<AccountLabelSkeleton />}>
              <AccountLabel />
            </Suspense>
            <SignOutButton />
          </div>
          <Suspense>
            <AccountMobileTabs />
          </Suspense>
          <Sections>
            <Suspense>
              <AccountGate>{children}</AccountGate>
            </Suspense>
          </Sections>
        </div>
      </Container>
    </Page>
  );
}

async function AccountGate({ children }: { children: ReactNode }) {
  if (!shopConfig.auth.isEnabled) notFound();
  await requireCustomerSession();
  return <>{children}</>;
}

async function AccountLabel() {
  if (!shopConfig.auth.isEnabled) notFound();
  await requireCustomerSession();
  const accessToken = await getCustomerAccessToken();
  if (!accessToken) {
    return <p className="type-body-sm font-normal">Account</p>;
  }
  const profile = await getCustomerProfile();
  if (!profile) return null;
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  return (
    <div>
      <p className="type-body-sm font-normal">{name || profile.email}</p>
      <p className="type-body-sm text-muted-foreground">{profile.email}</p>
    </div>
  );
}

function AccountLabelSkeleton() {
  return (
    <div className="grid gap-1.5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <Skeleton className="h-9 w-full rounded-none" />
      <Skeleton className="h-9 w-full rounded-none" />
      <Skeleton className="h-9 w-full rounded-none" />
    </div>
  );
}
