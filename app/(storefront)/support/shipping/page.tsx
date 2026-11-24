import type { Metadata } from "next";

import { SupportAside, SupportRelated } from "@/components/support/support-aside";
import { SupportPage } from "@/components/support/support-page";
import {
  SupportActionLink,
  SupportCard,
  SupportSteps,
} from "@/components/support/support-sections";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/support/shipping" }),
  description: `Delivery, cancellation windows and dispatch locks for ${shopConfig.site.name} orders.`,
  openGraph: buildOpenGraph({
    description: `Delivery, cancellation windows and dispatch locks for ${shopConfig.site.name} orders.`,
    title: "Shipping & 24h cancellation",
    type: "website",
    url: "/support/shipping",
  }),
  title: "Shipping & 24h cancellation",
};

export default function ShippingPolicyPage() {
  return (
    <SupportPage
      aside={
        <SupportAside title="At a glance">
          <SupportCard title="Within 24h · Before dispatch lock">
            Original payment-method refund. Address correction available.
          </SupportCard>
          <SupportCard title="After 24h · Before dispatch lock">
            Account Balance wallet credit. Address correction unavailable.
          </SupportCard>
          <SupportCard title="After dispatch lock">No cancellation or address changes.</SupportCard>
          <SupportRelated
            links={[
              { href: "/pages/shipping-returns", label: "Full shipping policy" },
              { href: "/support/returns", label: "Returns & alterations" },
              { href: "/support/legal", label: "Terms & privacy" },
              { href: "/support", label: "Concierge & contact" },
            ]}
          />
        </SupportAside>
      }
      breadcrumb={[
        { href: "/", label: "Home" },
        { href: "/support", label: "Support" },
        { label: "Shipping & cancellation" },
      ]}
      intro="Understand when your order can be updated, cancelled or tracked."
      title="Shipping & 24h cancellation policy"
    >
      <SupportSteps
        items={[
          {
            body: "Delivery availability is checked using your destination at checkout. Open Track Order for the latest dispatch and courier status.",
            title: "Delivery & tracking",
          },
          {
            body: "Before the order is locked for dispatch, contact the concierge within 24 hours to cancel. The amount returns to the original payment method. Address corrections are available within this window.",
            title: "Within 24 hours",
          },
          {
            body: "Before dispatch lock, the concierge can cancel after 24 hours and issue an Account Balance credit, not a card refund. Address correction is no longer available.",
            title: "After 24 hours",
          },
          {
            body: "Once your order is locked for dispatch, cancellation and address changes are unavailable. Follow the delivery status using your order reference.",
            title: "Locked for dispatch",
          },
          {
            body: "Cancellation is unavailable after delivery. If eligible, start an item-level exchange or return from your delivered order.",
            title: "After delivery",
          },
        ]}
      />
      <div className="grid gap-6">
        <Button className="w-full" render={<Link href="/account/orders" />} size="lg">
          Track My Order
        </Button>
        <p className="type-body-sm text-ink-muted">
          Need help with delivery?{" "}
          <SupportActionLink href="/support">Contact concierge</SupportActionLink>
        </p>
      </div>
    </SupportPage>
  );
}
