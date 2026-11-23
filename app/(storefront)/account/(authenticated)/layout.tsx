import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { AccountMobileNav } from "@/components/account/mobile-nav";
import { AccountSidebar } from "@/components/account/sidebar";
import { SignOutButton } from "@/components/account/sign-out-button";
import { Container } from "@/components/ui/container";
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
    <Page className="flex flex-1 flex-col">
      <Container className="flex flex-1 flex-col desktop:flex-row">
        <aside className="hidden w-72 shrink-0 desktop:block desktop:border-r desktop:border-rule desktop:pr-10">
          <div className="sticky top-24 grid gap-6">
            <Suspense fallback={<AccountLabelSkeleton />}>
              <AccountLabel />
            </Suspense>
            <Suspense fallback={<SidebarSkeleton />}>
              <AccountSidebar />
            </Suspense>
            <hr className="border-rule" />
            <SignOutButton />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6 desktop:pl-10">
          <div className="desktop:hidden">
            <Suspense fallback={<MobileNavSkeleton />}>
              <AccountMobileNav />
            </Suspense>
          </div>
          <div className="grid gap-6">
            <Suspense>
              <AccountGate>{children}</AccountGate>
            </Suspense>
          </div>
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
    return <p className="type-h3 text-ink">My account</p>;
  }
  const profile = await getCustomerProfile();
  if (!profile) return null;
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  return (
    <div className="grid gap-3">
      <p className="type-h3 text-ink">My account</p>
      <p className="type-body-sm text-ink-muted">{name || profile.email}</p>
    </div>
  );
}

function AccountLabelSkeleton() {
  return (
    <div className="grid gap-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="grid gap-1">
      {Array.from({ length: 7 }).map((_, index) => (
        <Skeleton className="h-9 w-full rounded-none" key={index} />
      ))}
    </div>
  );
}

function MobileNavSkeleton() {
  return (
    <div className="grid gap-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-9 w-full rounded-none" />
      <Skeleton className="h-px w-full" />
    </div>
  );
}
