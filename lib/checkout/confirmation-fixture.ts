import type { ConfirmationOrder } from "@/lib/checkout/types";

export type PreviewConfirmationState = "active" | "expired" | "guest" | "pending";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function getPreviewConfirmationOrder(state: PreviewConfirmationState): ConfirmationOrder {
  const now = Date.now();
  const isPending = state === "pending";
  const isExpired = state === "expired";

  return {
    discountCodes: [],
    email: "loremipsum@gmail.com",
    estimatedDeliveryAt: isPending ? null : new Date(now + 2 * DAY).toISOString(),
    financialStatus: isPending ? "PENDING" : "PAID",
    fulfillmentStatus: isPending ? "UNFULFILLED" : "FULFILLED",
    hasCustomerAccount: state !== "guest",
    id: "gid://shopify/Order/preview",
    lineItems: [
      {
        id: "gid://shopify/LineItem/preview",
        image: null,
        options: [
          { name: "color", value: "Noir" },
          { name: "size", value: "S" },
        ],
        quantity: 1,
        title: "LOREM IPSUM BLACK",
        total: { amount: "10000.00", currencyCode: "INR" },
      },
    ],
    name: "8844545798",
    paymentReference: isPending ? "PAY-8844545798" : null,
    processedAt: new Date(now - (isExpired ? 48 * HOUR : 2 * HOUR)).toISOString(),
    shipping: { amount: "0.00", currencyCode: "INR" },
    shippingAddress: {
      area: "Hadapsar, Pune, Maharashtra 411001, India",
      lines: [
        "2003, Aspire Tower,",
        "Amanora Township, Hadapsar",
        "Pune, Maharashtra - 411001, India",
      ],
      name: "Ashutosh Jalan",
      street: "Aspire Tower, Amanora Township",
      unit: "2003",
    },
    statusPageUrl: "https://example.com",
    subtotal: { amount: "10000.00", currencyCode: "INR" },
    tax: { amount: "1000.00", currencyCode: "INR" },
    total: { amount: "11000.00", currencyCode: "INR" },
    tracking: isPending
      ? null
      : {
          company: "Shiprocket",
          number: "SR8844545798",
          url: "https://example.com/track",
        },
  };
}
