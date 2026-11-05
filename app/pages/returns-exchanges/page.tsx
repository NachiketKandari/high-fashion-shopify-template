import type { Metadata } from "next";

import { ContentPage, ContentSection } from "@/components/content/content-page";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const ELIGIBILITY = [
  "Unworn and unused",
  "Unwashed",
  "In its original condition",
  "Returned with all original tags attached",
  "Free from makeup, deodorant or other stains",
  "Free from perfume or other strong scents",
  "Free from any signs of wear, alteration or damage",
];

const EXCLUSIONS = [
  "Sale and final-sale items",
  "Archive sale and end-of-season sale items",
  "Items marked as final sale on the website",
  "Customised or personalised orders",
  "Store credit",
  "Items that have been worn, washed, altered or damaged",
  "Items without their original tags",
  "Items with makeup, deodorant or other stains",
  "Items with perfume, body odour or other strong scents",
];

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/pages/returns-exchanges" }),
  description: "How to return or exchange a Polite Society order.",
  openGraph: buildOpenGraph({
    description: "How to return or exchange a Polite Society order.",
    title: "Returns & Exchanges",
    type: "website",
    url: "/pages/returns-exchanges",
  }),
  title: "Returns & Exchanges",
};

export default function ReturnsPage() {
  return (
    <ContentPage title="Returns & Exchanges">
      <ContentSection>
        <p>
          Return requests must be raised within 14 days of delivery. Approved domestic returns are
          issued as store credit equivalent to the value of the returned item, redeemable online and
          in-store. International orders are not eligible for refunds or direct exchanges, except
          for wrong, damaged or faulty items.
        </p>
        <p>
          Returns must be shipped on a Delivered Duty Paid (DDP) basis, with all shipping costs,
          duties and taxes prepaid by the customer. Returned items must reach our designated
          warehouse for inspection. A ₹250 return shipping fee is deducted from domestic store
          credit, unless the item is wrong, damaged or faulty.
        </p>
      </ContentSection>

      <ContentSection heading="Eligibility">
        <p>To be eligible for a return or exchange, the item must be:</p>
        <ul className="grid gap-1.5 pl-5" role="list">
          {ELIGIBILITY.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection heading="Items that cannot be returned">
        <ul className="grid gap-1.5 pl-5" role="list">
          {EXCLUSIONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>All sale orders are final sale and cannot be returned or exchanged.</p>
      </ContentSection>

      <ContentSection heading="Wrong, damaged or faulty items">
        <p>
          Email hi@politesociety.in within 24 hours of delivery, whether the order is domestic or
          international. Include your order number, photos or videos of the item, photos clearly
          showing the issue, and photos of the packaging if it arrived damaged. Do not wear, wash or
          alter the item before contacting us.
        </p>
        <p>
          Once we review the issue we will arrange a replacement, exchange, store credit or refund
          depending on the circumstances. Approved refunds are processed within 8–10 business days
          after we receive and inspect the item.
        </p>
      </ContentSection>

      <ContentSection heading="How to return or exchange">
        <ol className="grid gap-3 pl-5" role="list">
          <li>
            Submit your request through the contact page with your order number and the item you
            want to return or exchange.
          </li>
          <li>Wait for approval before sending anything back.</li>
          <li>
            For domestic orders we arrange a courier pickup, usually within 2–3 business days. For
            international orders the return shipment is organised by the customer on a DDP basis.
          </li>
          <li>
            Our team checks the item on arrival. The return is approved only if it meets the
            requirements above.
          </li>
        </ol>
      </ContentSection>

      <ContentSection heading="Store credit">
        <p>
          Store credit is valid for six months from issue, cannot be extended, exchanged for cash or
          transferred to another person. Orders placed using store credit cannot be returned or
          exchanged unless the item received is wrong, damaged or faulty.
        </p>
      </ContentSection>

      <ContentSection heading="Order cancellations">
        <p>
          Contact us as soon as possible at hi@politesociety.in with your order number. We may not
          be able to cancel or change an order once it has been processed or shipped.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
