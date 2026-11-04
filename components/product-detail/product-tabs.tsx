"use client";

import { useState } from "react";

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
            className="shrink-0 border-b border-transparent pb-1 text-2xs uppercase tracking-wider data-[active=true]:border-foreground"
            data-active={activeTab === tab}
            id={`product-tab-${index}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            tabIndex={activeTab === tab ? 0 : -1}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Description" && descriptionHtml ? (
        <div
          aria-labelledby="product-tab-0"
          className="prose prose-sm max-w-none text-xs leading-[19px] text-foreground prose-p:my-0 prose-ul:my-0 prose-li:my-0"
          id="product-panel-0"
          role="tabpanel"
          tabIndex={0}
          // oxlint-disable-next-line react/no-danger -- Product descriptions pass through sanitizeShopifyHtml when fetched.
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      ) : (
        <div
          aria-labelledby={`product-tab-${TABS.indexOf(activeTab)}`}
          id={`product-panel-${TABS.indexOf(activeTab)}`}
          role="tabpanel"
          tabIndex={0}
        >
          <p className="text-xs leading-[19px] text-foreground">{STATIC_CONTENT[activeTab]}</p>
        </div>
      )}
    </div>
  );
}
