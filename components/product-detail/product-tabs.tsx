"use client";

import { type KeyboardEvent, useRef, useState } from "react";

const TABS = ["Description", "Shipping, Exchange & Returns", "Fabric", "Fit"] as const;

const STATIC_CONTENT: Record<(typeof TABS)[number], string> = {
  Description: "",
  Fit: "True to size. The model is wearing a size XS.",
  Fabric: "Dry clean on low heat. Do not bleach. Cool iron on the reverse.",
  "Shipping, Exchange & Returns":
    "Complimentary shipping worldwide above $500. Orders dispatch within 2–3 business days. Exchanges are accepted within 14 days of delivery.",
};

export function ProductTabs({ descriptionHtml }: { descriptionHtml: string }) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Description");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = TABS.length - 1;
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = index === lastIndex ? 0 : index + 1;
    if (event.key === "ArrowLeft") nextIndex = index === 0 ? lastIndex : index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = lastIndex;
    if (nextIndex === null) return;
    event.preventDefault();
    setActiveTab(TABS[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="grid gap-5">
      <div
        aria-label="Product information"
        className="scrollbar-hide flex gap-5 overflow-x-auto border-b border-transparent"
        role="tablist"
      >
        {TABS.map((tab, index) => (
          <button
            aria-controls={`product-panel-${index}`}
            aria-selected={activeTab === tab}
            className="type-tab focus-ring flex min-h-9 min-w-9 shrink-0 items-center justify-center border-b border-transparent data-[active=true]:border-ink"
            data-active={activeTab === tab}
            id={`product-tab-${index}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            tabIndex={activeTab === tab ? 0 : -1}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {TABS.map((tab, index) => (
        <div
          aria-labelledby={`product-tab-${index}`}
          hidden={activeTab !== tab}
          id={`product-panel-${index}`}
          key={tab}
          role="tabpanel"
          tabIndex={0}
        >
          {tab === "Description" && descriptionHtml ? (
            <div
              className="type-body-sm text-ink-muted [&_li]:m-0 [&_p]:m-0 [&_ul]:m-0 [&_ul]:grid [&_ul]:gap-0.5"
              // oxlint-disable-next-line react/no-danger -- Product descriptions pass through sanitizeShopifyHtml when fetched.
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          ) : (
            <p className="type-body-sm text-ink-muted">{STATIC_CONTENT[tab]}</p>
          )}
        </div>
      ))}
    </div>
  );
}
