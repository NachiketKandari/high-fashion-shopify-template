import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { ACCOUNT_LINKS } from "@/components/account/links";
import { AccountMobileMenu } from "@/components/account/mobile-menu";
import { AccountSidebar } from "@/components/account/sidebar";
import { SignOutButton } from "@/components/account/sign-out-button";
import { Page } from "@/components/ui/page";
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
    <Page className="flex flex-1 flex-col pt-0">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col desktop:flex-row">
        <aside className="hidden w-72 shrink-0 border-r border-ink-strong px-10 py-10 desktop:block">
          <div className="sticky top-10 grid gap-6">
            <Suspense fallback={<AccountLabelSkeleton />}>
              <AccountLabel />
            </Suspense>
            <Suspense fallback={<SidebarSkeleton />}>
              <AccountSidebar links={ACCOUNT_LINKS} />
            </Suspense>
            <div className="grid gap-6">
              <hr className="border-rule" />
              <SignOutButton />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col px-6 py-6 desktop:px-10 desktop:py-10">
          <div className="mb-6 desktop:hidden">
            <AccountMobileMenu links={ACCOUNT_LINKS} signOut={<SignOutButton />} />
          </div>
          <Suspense>
            <AccountGate>
              <div className="grid gap-6">{children}</div>
            </AccountGate>
          </Suspense>
        </div>
      </div>
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
    return <p className="type-h3 text-ink-strong">My account</p>;
  }
  const profile = await getCustomerProfile();
  if (!profile) return null;
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  return (
    <div className="grid gap-1">
      <p className="type-h3 text-ink-strong">My account</p>
      <p className="type-body-sm text-ink-muted">{name || profile.email}</p>
    </div>
  );
}

function AccountLabelSkeleton() {
  return (
    <div className="grid gap-1.5">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <Skeleton className="h-10 w-full rounded-none" />
      <Skeleton className="h-10 w-full rounded-none" />
      <Skeleton className="h-10 w-full rounded-none" />
    </div>
  );
}
