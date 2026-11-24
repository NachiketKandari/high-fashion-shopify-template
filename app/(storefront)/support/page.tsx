import type { Metadata } from "next";

import { SupportAside } from "@/components/support/support-aside";
import { SupportContactForm } from "@/components/support/support-contact-form";
import { SupportPage } from "@/components/support/support-page";
import {
  SupportCard,
  SupportInlineLink,
  SupportRuleLinks,
} from "@/components/support/support-sections";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const DESCRIPTION = `Contact the ${shopConfig.site.name} concierge, track an order and find help with shipping, returns, sizing and care.`;

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/support" }),
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    description: DESCRIPTION,
    title: "Support",
    type: "website",
    url: "/support",
  }),
  title: "Support",
};

const QUICK_ANSWERS = [
  { href: "/support/shipping", label: "Shipping & 24h cancellation" },
  { href: "/support/returns", label: "Returns & alterations" },
  { href: "/pages/size-guide", label: "Sizing & fit" },
  { href: "/support/atelier", label: "Inside the atelier" },
];

export default function SupportHubPage() {
  const { contact } = shopConfig.site;

  return (
    <SupportPage
      aside={
        <SupportAside title="Send a message">
          <SupportContactForm />
        </SupportAside>
      }
      breadcrumb={[{ href: "/", label: "Home" }, { label: "Support" }]}
      intro="For a question about a piece, an order or your account, I’m here to help."
      title="Your personal concierge"
    >
      <div className="grid gap-6">
        <SupportCard title="An existing order?">
          <p>
            Have your order reference ready so we can help you with delivery, cancellations or
            returns.
          </p>
          <Button className="w-full" render={<Link href="/account/orders" />} size="lg">
            Track an Order
          </Button>
        </SupportCard>
        <SupportCard title="Talk to the concierge">
          <p>Choose the channel that suits you.</p>
          <Button
            className="w-full"
            render={
              <a href={contact.whatsappHref} rel="noreferrer" target="_blank">
                Start a Conversation
              </a>
            }
            size="lg"
          >
            Start a Conversation
          </Button>
          <p className="type-body-sm text-ink">
            Email{" "}
            <SupportInlineLink href={`mailto:${contact.email}`}>{contact.email}</SupportInlineLink>
          </p>
          <p>We reply to the email address you provide.</p>
        </SupportCard>
        <div className="grid gap-6">
          <h2 className="type-h4 text-ink">Quick answers</h2>
          <SupportRuleLinks links={QUICK_ANSWERS} />
          <p className="type-body-sm text-ink-muted">
            Never share passwords, OTPs or card details with support.
          </p>
        </div>
      </div>
    </SupportPage>
  );
}
