import type { Metadata } from "next";

import { ContentPage, ContentSection } from "@/components/content/content-page";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/pages/privacy-policies" }),
  description: "How Polite Society collects, uses and protects personal information.",
  openGraph: buildOpenGraph({
    description: "How Polite Society collects, uses and protects personal information.",
    title: "Privacy Policy",
    type: "website",
    url: "/pages/privacy-policies",
  }),
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <ContentPage title="Privacy Policies">
      <ContentSection>
        <p>
          Polite Society is a Mumbai-based fashion and lifestyle brand operated by Surmai Design
          Studio LLP (“Polite Society”, “we”, “us” or “our”). This policy explains how we collect,
          use, store, disclose and otherwise process personal information when you visit or purchase
          through www.politesocietyshop.com, contact customer support or otherwise engage with our
          services.
        </p>
        <p>
          By accessing or using the website you acknowledge that you have read and understood this
          policy.
        </p>
      </ContentSection>

      <ContentSection heading="1. Who we are">
        <p>
          Polite Society is operated by Surmai Design Studio LLP, A-105, Trade Square, Saki Naka,
          Mumbai, Maharashtra, India. Email: hi@politesociety.in. Website:
          www.politesocietyshop.com. Surmai Design Studio LLP determines how and why personal
          information is processed.
        </p>
      </ContentSection>

      <ContentSection heading="2. Personal information we collect">
        <p>
          When you place an order, create an account, contact us, subscribe to communications,
          request a return or exchange, use store credit, participate in a promotion or otherwise
          interact with us, we may collect your name, email address, phone number, billing and
          shipping addresses, payment and transaction information, order history, return and
          exchange information, store credit information, customer service correspondence and
          information you voluntarily provide through forms or messages.
        </p>
        <p>
          We do not generally store complete payment card details ourselves. Payments may be
          processed by third-party gateways and payment service providers under their own privacy
          policies.
        </p>
        <p>
          When you visit the website we may automatically collect IP address, browser and device
          information, time zone, approximate location, language preferences, pages and products
          viewed, search queries, referring and exit pages, visit times, interaction information and
          cookie data (“Device Information”).
        </p>
      </ContentSection>

      <ContentSection heading="3. Cookies, pixels and similar technologies">
        <p>
          We use cookies, pixels, tags, web beacons and similar technologies to keep the site
          functioning, remember cart items and preferences, understand traffic and usage, analyse
          browsing, measure advertising performance, provide relevant marketing, improve
          functionality and security, and detect fraud. You can control cookies through your browser
          or device settings; disabling some cookies may affect site features.
        </p>
      </ContentSection>

      <ContentSection heading="4. How we use personal information">
        <p>
          We use personal information to process orders and payments, arrange shipping and delivery,
          provide invoices and confirmations, process returns, exchanges, refunds and store credit,
          communicate about orders and support, respond to enquiries, send marketing communications
          where permitted, improve the website and business, understand customer preferences,
          measure marketing effectiveness, prevent fraud, protect our business and comply with legal
          obligations.
        </p>
      </ContentSection>

      <ContentSection heading="5. How we share personal information">
        <p>
          We do not sell personal information as a standalone commercial product. We may share it
          with e-commerce and technology providers including Shopify, payment providers, shipping
          and logistics providers, analytics and advertising providers including Google Analytics,
          customer service and communication providers, professional advisers, legal and regulatory
          authorities where required, and in connection with a business transfer.
        </p>
      </ContentSection>

      <ContentSection heading="6. International transfers and retention">
        <p>
          Some providers may process personal information outside India. Where information is
          transferred outside India we take reasonable steps to ensure processing complies with
          applicable data protection laws. If you are outside India, including in the EEA or UK,
          your information may be transferred to and processed in India and other countries where
          our providers operate.
        </p>
        <p>
          We retain personal information only as long as reasonably necessary to complete
          transactions, provide support, manage returns and credit, maintain business and financial
          records, meet legal and regulatory requirements, resolve disputes, prevent fraud and
          enforce agreements. When it is no longer required we may delete, anonymise or securely
          dispose of it.
        </p>
      </ContentSection>

      <ContentSection heading="7. Your privacy rights">
        <p>
          Depending on your location and applicable law, you may have the right to request
          information about the personal information we process, correct inaccurate information,
          request deletion where applicable, withdraw consent, raise a grievance, opt out of
          marketing and exercise other rights available under law.
        </p>
        <p>
          For individuals whose personal information is governed by India&apos;s Digital Personal
          Data Protection framework, applicable rights will be provided in accordance with the
          Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules,
          2025 as they come into force. Exercise rights by writing to hi@politesociety.in. We may
          need to verify your identity before processing certain requests.
        </p>
      </ContentSection>

      <ContentSection heading="8. Marketing communications">
        <p>
          If you opt in, we may contact you by email, SMS, WhatsApp or other channels for which you
          provided contact information. You can unsubscribe using the instructions in the
          communication or by writing to hi@politesociety.in. Opting out does not prevent essential
          transactional or service messages such as order, payment, shipping, return or exchange
          updates.
        </p>
      </ContentSection>

      <ContentSection heading="9–14. Third parties, children, do not track, security and changes">
        <p>
          Our website may link to third-party sites and services. We are not responsible for their
          privacy practices, security or content; review their policies before providing personal
          information. Our site is intended for a general audience and we do not knowingly collect
          personal information from children where prohibited by law.
        </p>
        <p>
          Some browsers offer a “Do Not Track” setting. Because there is no universally accepted
          standard, our site may not respond to all such signals. We take reasonable technical and
          organisational measures to protect personal information, but no method of electronic
          transmission or storage is completely secure. If we become aware of a personal data breach
          we will investigate, contain and mitigate it and notify affected individuals or
          authorities where required by law.
        </p>
        <p>
          We may update this policy to reflect changes to our business, website, technology,
          providers, laws or practices. We will update the “Last Updated” date when changes are
          made. Review the policy periodically.
        </p>
      </ContentSection>

      <ContentSection heading="15. Contact us">
        <p>
          Questions about this policy, privacy rights or grievances: Surmai Design Studio LLP,
          A-105, Trade Square, Saki Naka, Mumbai, Maharashtra, India. Email: hi@politesociety.in.
          Website: www.politesocietyshop.com. We will review and respond within the time periods
          required by applicable law.
        </p>
        <p>© Surmai Design Studio LLP. All rights reserved.</p>
      </ContentSection>
    </ContentPage>
  );
}
