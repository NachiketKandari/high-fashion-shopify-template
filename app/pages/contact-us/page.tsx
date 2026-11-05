import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/components/content/contact-form";
import { ContentPage, ContentSection } from "@/components/content/content-page";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const { contact } = shopConfig.site;

const CHANNELS = [
  {
    href: contact.phoneHref,
    icon: Phone,
    label: "Call us",
    lines: [contact.phone, "Monday – Sunday, 11AM to 8PM IST"],
  },
  {
    href: contact.whatsappHref,
    icon: MessageCircle,
    label: "WhatsApp",
    lines: [contact.phone, "Monday – Sunday, 11AM to 8PM IST"],
  },
  {
    href: `mailto:${contact.email}`,
    icon: Mail,
    label: "Email",
    lines: [contact.email, "We reply within one working day."],
  },
  {
    href: contact.mapUrl,
    icon: MapPin,
    label: "Visit us",
    lines: [contact.address, "Open daily, 11am – 8pm"],
  },
];

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/pages/contact-us" }),
  description: `Contact ${shopConfig.site.name} about orders, sizing, returns and appointments.`,
  openGraph: buildOpenGraph({
    description: `Contact ${shopConfig.site.name} about orders, sizing, returns and appointments.`,
    title: "Contact Us",
    type: "website",
    url: "/pages/contact-us",
  }),
  title: "Contact Us",
};

export default function ContactPage() {
  return (
    <ContentPage title="Need help?">
      <ContentSection>
        <p>
          Our team is here for product and sizing questions, orders, returns and anything else.
          Reach us on the phone, on WhatsApp or by e-mail — or send a message below.
        </p>
      </ContentSection>

      <div className="grid gap-8 tablet:grid-cols-2">
        {CHANNELS.map((channel) => {
          const Icon = channel.icon;
          return (
            <a
              className="grid content-start gap-3 border-t border-rule pt-4 transition-opacity hover:opacity-60"
              href={channel.href}
              key={channel.label}
              rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
            >
              <span className="type-label flex items-center gap-2">
                <Icon className="size-4" strokeWidth={1.25} />
                {channel.label}
              </span>
              {channel.lines.map((line) => (
                <span className="type-body text-ink-muted" key={line}>
                  {line}
                </span>
              ))}
            </a>
          );
        })}
      </div>

      <ContentSection heading="Send us a message">
        <ContactForm />
        <p className="type-label text-ink-muted">
          For career enquiries write to {contact.careersEmail}, and for collaborations to{" "}
          {contact.communityEmail}.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
