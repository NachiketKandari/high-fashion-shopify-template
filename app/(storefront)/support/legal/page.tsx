import type { Metadata } from "next";

import {
  SupportAnchorLinks,
  SupportAside,
  SupportRelated,
} from "@/components/support/support-aside";
import { SupportPage } from "@/components/support/support-page";
import { SupportPolicyTabs } from "@/components/support/support-policy-tabs";
import { SupportInlineLink, SupportSections } from "@/components/support/support-sections";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const DESCRIPTION = `Order, payment, returns and privacy terms for ${shopConfig.site.name}, with links to the full policies.`;

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/support/legal" }),
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    description: DESCRIPTION,
    title: "Terms of Service & Privacy",
    type: "website",
    url: "/support/legal",
  }),
  title: "Terms of Service & Privacy",
};

const TABS = [
  { id: "terms", label: "Terms of Service" },
  { id: "privacy", label: "Privacy Policy" },
];

const TERMS_ITEMS = [
  {
    body: "Review the item, selected options, delivery details and final amount before placing your order. Confirmation and payment status are available in your order details.",
    id: "orders-payment",
    title: "Terms / Orders & payment",
  },
  {
    body: (
      <>
        Cancellation timing, dispatch lock and item-level return eligibility are described in the{" "}
        <SupportInlineLink href="/support/shipping">shipping</SupportInlineLink> and{" "}
        <SupportInlineLink href="/support/returns">returns</SupportInlineLink> guides. Review these
        before submitting a request.
      </>
    ),
    id: "cancellation-returns",
    title: "Terms / Cancellation & returns",
  },
  {
    body: "Eligible credits and their use are confirmed with your return. Review the applicable credit conditions before using the balance.",
    id: "account-balance",
    title: "Terms / Account Balance",
  },
];

const PRIVACY_ITEMS = [
  {
    body: "Contact details, delivery addresses and order records support checkout, delivery and customer service. The full Privacy Policy describes the information we collect and its purposes.",
    id: "information-we-collect",
    title: "Privacy / Information we collect",
  },
  {
    body: (
      <>
        Update your account details in your{" "}
        <SupportInlineLink href="/account/profile">profile</SupportInlineLink>. Contact the
        concierge to request information about access, correction or account deletion.
      </>
    ),
    id: "preferences-requests",
    title: "Privacy / Your preferences & requests",
  },
  {
    body: "Our cookie notice describes cookies, processing partners, retention and the applicable choices.",
    id: "cookies-providers",
    title: "Privacy / Cookies & service providers",
  },
];

const ANCHOR_LINKS = [
  { href: "orders-payment", label: "Orders & payment" },
  { href: "cancellation-returns", label: "Cancellation & returns" },
  { href: "account-balance", label: "Account Balance" },
  { href: "information-we-collect", label: "Information we collect" },
  { href: "preferences-requests", label: "Your preferences & requests" },
  { href: "cookies-providers", label: "Cookies & service providers" },
];

const RELATED_LINKS = [
  { href: "/pages/terms-of-service", label: "Full Terms of Service" },
  { href: "/pages/privacy-policies", label: "Full Privacy Policy" },
  { href: "/support/shipping", label: "Shipping & 24h cancellation" },
  { href: "/support/returns", label: "Returns & alterations" },
];

export default function LegalPage() {
  return (
    <SupportPage
      aside={
        <SupportAside title="On this page">
          <SupportAnchorLinks links={ANCHOR_LINKS} />
          <SupportRelated links={RELATED_LINKS} />
        </SupportAside>
      }
      breadcrumb={[
        { href: "/", label: "Home" },
        { href: "/support", label: "Support" },
        { label: "Terms & privacy" },
      ]}
      intro="How orders, payment, returns and your information are handled, with links to the full policies."
      title="Terms of Service & Privacy"
    >
      <SupportPolicyTabs tabs={TABS} />
      <div className="grid scroll-mt-24 gap-6" id="terms">
        <SupportSections items={TERMS_ITEMS} />
        <p className="type-body-sm text-ink-muted">
          Read the full{" "}
          <SupportInlineLink href="/pages/terms-of-service">Terms of Service</SupportInlineLink>.
        </p>
      </div>
      <div className="grid scroll-mt-24 gap-6" id="privacy">
        <SupportSections items={PRIVACY_ITEMS} />
        <p className="type-body-sm text-ink-muted">
          Read the full{" "}
          <SupportInlineLink href="/pages/privacy-policies">Privacy Policy</SupportInlineLink>.
        </p>
      </div>
      <div className="grid gap-6 border-t border-rule pt-6">
        <p className="type-body-sm text-ink">Contact for privacy requests</p>
        <Button className="w-full" render={<Link href="/support" />} size="lg" variant="outline">
          Contact the concierge
        </Button>
      </div>
    </SupportPage>
  );
}
