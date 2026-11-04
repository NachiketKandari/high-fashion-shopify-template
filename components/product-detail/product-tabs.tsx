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
      <div className="scrollbar-hide flex gap-5 overflow-x-auto border-b border-transparent">
        {TABS.map((tab) => (
          <button
            className="shrink-0 border-b border-transparent pb-1 text-2xs uppercase tracking-wider data-[active=true]:border-foreground"
            data-active={activeTab === tab}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Description" && descriptionHtml ? (
        <div
          className="prose prose-sm max-w-none text-xs leading-[19px] text-foreground prose-p:my-0 prose-ul:my-0 prose-li:my-0"
          // oxlint-disable-next-line react/no-danger -- Product descriptions pass through sanitizeShopifyHtml when fetched.
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      ) : (
        <p className="text-xs leading-[19px] text-foreground">{STATIC_CONTENT[activeTab]}</p>
      )}
    </div>
  );
}
