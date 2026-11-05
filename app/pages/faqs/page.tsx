import type { Metadata } from "next";

import { ContentPage, ContentSection } from "@/components/content/content-page";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const FAQS = [
  {
    answer:
      "Choose your piece, select a colour and size, and add it to your cart. Checkout is hosted by Shopify, where you can pay by card, UPI or the payment methods available for your region.",
    question: "How do I place an order?",
  },
  {
    answer:
      "We accept major credit and debit cards, UPI, net banking and wallet payments through Shopify checkout. Available methods are shown at checkout for your delivery country.",
    question: "What payment methods do you accept?",
  },
  {
    answer:
      "Write to hi@politesociety.in as soon as possible with your order number. We can change or cancel an order before it is processed or shipped.",
    question: "Can I change or cancel my order?",
  },
  {
    answer:
      "Standard orders are dispatched within 6–7 business days within India. Made-to-order and made-to-measure pieces take 1–2 weeks. You will receive a tracking link by email when each shipment leaves.",
    question: "When will my order be dispatched?",
  },
  {
    answer:
      "Once your order ships, we email a tracking link. You can also contact us on WhatsApp at +91 89760 64836 with your order number.",
    question: "How can I track my order?",
  },
  {
    answer:
      "Yes. International shipping is approximately $30 (INR 2,500), excluding duties and taxes. Orders are dispatched within 7–10 business days.",
    question: "Do you ship internationally?",
  },
  {
    answer:
      "Domestic returns and exchanges can be requested within 14 days of delivery. Approved domestic returns are issued as store credit; international orders are not eligible for refunds or direct exchanges except for wrong, damaged or faulty items.",
    question: "What is your return and exchange policy?",
  },
  {
    answer:
      "Use the contact page or email hi@politesociety.in with your order number and the item you want to return. Wait for approval before sending anything back.",
    question: "How do I make a return or exchange?",
  },
  {
    answer:
      "Approved refunds are processed within 8–10 business days after we receive and inspect the item. Domestic returns are normally issued as store credit valid for six months.",
    question: "When will I receive my refund?",
  },
  {
    answer:
      "Email hi@politesociety.in within 24 hours of delivery with your order number, photos of the item and photos of the packaging. Do not wear, wash or alter the item before contacting us.",
    question: "My order arrived faulty or incorrect. What should I do?",
  },
  {
    answer:
      "Compare your measurements with the size guide. If you are between sizes, write to us before ordering and we will help you choose.",
    question: "How do I find my size?",
  },
  {
    answer:
      "Follow the care label on each garment. The care guide covers corsets and other pieces, including dry cleaning, washing and ironing instructions.",
    question: "How should I care for my pieces?",
  },
  {
    answer:
      "Restocks depend on the fabric and production schedule. Follow us on Instagram or join the newsletter for restock announcements.",
    question: "Will a sold-out piece be restocked?",
  },
  {
    answer:
      "Visit us at Shop No. 1, Solace Apartment, 33rd Road, Bandra West, Mumbai. We are open daily, 11am – 8pm.",
    question: "Where can I visit you?",
  },
  {
    answer:
      "Call or WhatsApp +91 89760 64836, email hi@politesociety.in, or use the contact form. We reply within one working day.",
    question: "How do I contact customer care?",
  },
];

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/pages/faqs" }),
  description: "Answers about orders, shipping, returns, sizing and care at Polite Society.",
  openGraph: buildOpenGraph({
    description: "Answers about orders, shipping, returns, sizing and care at Polite Society.",
    title: "FAQ",
    type: "website",
    url: "/pages/faqs",
  }),
  title: "FAQ",
};

export default function FaqPage() {
  return (
    <ContentPage title="FAQ">
      <ContentSection>
        <Accordion>
          {FAQS.map((faq) => (
            <AccordionItem key={faq.question}>
              <AccordionTrigger className="text-xs uppercase tracking-wider">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl text-sm leading-[22px] font-light tracking-wide text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ContentSection>
    </ContentPage>
  );
}
