import type { Metadata } from "next";

import { ContentPage, ContentSection } from "@/components/content/content-page";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/pages/shipping-returns" }),
  description: "Shipping fees, delivery times and tracking for Polite Society orders.",
  openGraph: buildOpenGraph({
    description: "Shipping fees, delivery times and tracking for Polite Society orders.",
    title: "Shipping & Delivery",
    type: "website",
    url: "/pages/shipping-returns",
  }),
  title: "Shipping & Delivery",
};

export default function ShippingPage() {
  return (
    <ContentPage title="Shipping & Delivery">
      <ContentSection heading="Domestic orders (within India)">
        <p>
          We offer free standard shipping for orders above INR 5,000 across India. A flat fee of INR
          100 is charged on orders below INR 5,000. Express shipping charges vary by parcel weight
          and are available for metro cities. To opt for express shipping, WhatsApp us at +91 89760
          64836 or email hi@politesociety.in. Express requests can be accepted or declined subject
          to product availability.
        </p>
      </ContentSection>

      <ContentSection heading="Delivery time frame">
        <p>
          Standard orders are typically dispatched within 6–7 business days (Monday–Friday) within
          India. Express orders arrive within 1–2 business days. If a piece is not readily
          available, we allow time to restock and a team member will email you about the delay.
        </p>
        <p>
          Made-to-measure and made-to-order pieces have a standard dispatch window of 1–2 weeks. If
          you order multiple items, they may be processed in multiple shipments; you will receive a
          tracking number as each shipment leaves.
        </p>
      </ContentSection>

      <ContentSection heading="Tracking">
        <p>
          Once your order is shipped you will receive a tracking link by email. Use it to follow the
          status of your delivery with the courier.
        </p>
      </ContentSection>

      <ContentSection heading="Service delays">
        <p>
          Polite Society is not responsible for unexpected delays caused by bad weather, natural
          disasters or clearance delays. Contact the courier directly with the tracking number for
          updates.
        </p>
      </ContentSection>

      <ContentSection heading="International orders (outside India)">
        <p>
          International shipping is approximately $30 (INR 2,500), excluding customs duties levied
          at the destination. Duties, taxes and import charges are the customer&apos;s
          responsibility; contact your local customs office before ordering if you need an estimate.
        </p>
        <p>
          International orders are dispatched within 7–10 business days. Delivery timelines vary by
          destination pincode. If a piece is not readily available, we will email you about the
          restock delay.
        </p>
      </ContentSection>

      <ContentSection heading="Failed delivery">
        <p>
          Polite Society is not responsible for charges related to return shipment when delivery
          fails because of an incorrect address, contact details, repeated failed attempts or
          refusal to pay customs fees. If the order is returned and must be sent again, shipping
          fees are payable again.
        </p>
      </ContentSection>

      <ContentSection heading="Returns & exchanges">
        <p>
          We do not accept returns or exchanges on international orders. Domestic returns and
          exchanges are covered under the returns policy.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
