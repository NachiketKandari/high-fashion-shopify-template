import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/components/content/contact-form";
import { ContentPage, ContentSection } from "@/components/content/content-page";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const CHANNELS = [
  {
    href: "tel:+918976064836",
    icon: Phone,
    label: "Call us",
    lines: ["+91 89760 64836", "Monday – Sunday, 11AM to 8PM IST"],
  },
  {
    href: "https://wa.me/918976064836",
    icon: MessageCircle,
    label: "WhatsApp",
    lines: ["+91 89760 64836", "Monday – Sunday, 11AM to 8PM IST"],
  },
  {
    href: "mailto:hi@politesociety.in",
    icon: Mail,
    label: "Email",
    lines: ["hi@politesociety.in", "We reply within one working day."],
  },
  {
    href: "https://www.google.com/maps/place/Polite+Society/@19.0653993,72.8280942,17z",
    icon: MapPin,
    label: "Visit us",
    lines: [
      "Shop No. 1, Solace Apartment, 33rd Road, Bandra West, Mumbai",
      "Open daily, 11am – 8pm",
    ],
  },
];

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/pages/contact-us" }),
  description: "Contact Polite Society about orders, sizing, returns and appointments.",
  openGraph: buildOpenGraph({
    description: "Contact Polite Society about orders, sizing, returns and appointments.",
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

      <div className="grid gap-8 sm:grid-cols-2">
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
              <span className="flex items-center gap-2 text-2xs uppercase tracking-wider">
                <Icon className="size-4" strokeWidth={1.25} />
                {channel.label}
              </span>
              {channel.lines.map((line) => (
                <span
                  className="text-sm font-light leading-[21px] tracking-wide text-muted-foreground"
                  key={line}
                >
                  {line}
                </span>
              ))}
            </a>
          );
        })}
      </div>

      <ContentSection heading="Send us a message">
        <ContactForm />
        <p className="text-2xs leading-[18px] uppercase tracking-wider text-muted-foreground">
          For career enquiries write to careers@politesociety.in, and for collaborations to
          community@politesociety.in.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
