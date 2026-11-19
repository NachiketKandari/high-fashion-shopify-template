import { Accordion, type AccordionItem } from "@/components/ui/accordion";

const STATIC_CONTENT = {
  details:
    "True to size. The model is wearing a size XS. Dry clean on low heat. Do not bleach. Cool iron on the reverse.",
  shipping:
    "Complimentary shipping worldwide above ₹50,000. Orders dispatch within 2–3 business days. Exchanges are accepted within 14 days of delivery.",
};

export function ProductAccordion({ descriptionHtml }: { descriptionHtml: string }) {
  const items: AccordionItem[] = [
    {
      content: (
        <div className="type-body-sm text-ink-muted [&_li]:m-0 [&_p]:m-0 [&_ul]:m-0 [&_ul]:grid [&_ul]:gap-0.5">
          {descriptionHtml ? (
            // oxlint-disable-next-line react/no-danger -- Product descriptions pass through sanitizeShopifyHtml when fetched.
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          ) : (
            <p>No description for this piece yet.</p>
          )}
        </div>
      ),
      defaultOpen: true,
      id: "description",
      label: "Description",
    },
    {
      content: <p className="type-body-sm text-ink-muted">{STATIC_CONTENT.details}</p>,
      id: "details",
      label: "Details",
    },
    {
      content: <p className="type-body-sm text-ink-muted">{STATIC_CONTENT.shipping}</p>,
      id: "shipping",
      label: "Shipping",
    },
  ];

  return <Accordion className="[&>details:first-child]:border-t-0" items={items} />;
}
