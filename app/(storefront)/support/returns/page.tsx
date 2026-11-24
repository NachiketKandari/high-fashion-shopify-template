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
  alternates: buildAlternates({ pathname: "/support/returns" }),
  description: `How to request, prepare and track a return, exchange or alteration at ${shopConfig.site.name}.`,
  openGraph: buildOpenGraph({
    description: `How to request, prepare and track a return, exchange or alteration at ${shopConfig.site.name}.`,
    title: "Returns & alterations",
    type: "website",
    url: "/support/returns",
  }),
  title: "Returns & alterations",
};

export default function ReturnsPage() {
  return (
    <SupportPage
      aside={
        <SupportAside title="Your return journey">
          <p className="type-body-sm text-ink">
            Select items → Choose resolution → Add reason → Schedule pickup → Atelier inspection →
            Resolution
          </p>
          <SupportCard title="Before you start">
            Have your order reference ready and check the return window displayed on the order.
          </SupportCard>
          <SupportRelated
            links={[
              { href: "/pages/returns-exchanges", label: "Full returns policy" },
              { href: "/support/shipping", label: "Shipping & 24h cancellation" },
              { href: "/support/legal", label: "Terms & privacy" },
              { href: "/support", label: "Concierge & contact" },
            ]}
          />
        </SupportAside>
      }
      breadcrumb={[
        { href: "/", label: "Home" },
        { href: "/support", label: "Support" },
        { label: "Returns & alterations" },
      ]}
      intro="A step-by-step guide to requesting a resolution for an eligible item."
      title="Returns & alterations"
    >
      <SupportSteps
        items={[
          {
            body: "Open your delivered order to see its applicable return deadline. Select only the items you want to return; other items in the order are unaffected.",
            title: "Check eligibility",
          },
          {
            body: "Choose an exchange for another available size or colour, or request a return. Eligible settlement methods are shown during the request.",
            title: "Choose a resolution",
          },
          {
            body: "Keep the item unused with original tags and packaging intact. Pack only the items included in the request and follow the pickup instructions.",
            title: "Prepare for collection",
          },
          {
            body: "Reverse courier collection does not confirm acceptance. The atelier checks the item identity, tags, packaging and condition before approving a resolution.",
            title: "Atelier inspection",
          },
          {
            body: "Once approved, follow the request for exchange dispatch or credit status. The concierge shares issued credit notes.",
            title: "Settlement & documents",
          },
          {
            body: "Contact the concierge before sending an altered or customised piece. Eligibility and available options must be reviewed for the specific item.",
            title: "Alterations & special requests",
          },
        ]}
      />
      <div className="grid gap-6">
        <Button className="w-full" render={<Link href="/account/orders" />} size="lg">
          Start from My Order
        </Button>
        <p className="type-body-sm text-ink-muted">
          <SupportActionLink href="/support">Contact concierge about alterations</SupportActionLink>
        </p>
      </div>
    </SupportPage>
  );
}
