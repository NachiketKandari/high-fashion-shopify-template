import { gql } from "@shopify/hydrogen/customer-account";

import { ADDRESS_FRAGMENT } from "@/lib/shopify/fragments/customer-address";
import { RETURN_SUMMARY_FRAGMENT } from "@/lib/shopify/fragments/customer-return";

export const ORDER_SUMMARY_FRAGMENT = gql(`#graphql
  fragment OrderSummaryFields on Order {
    financialStatus
    fulfillmentStatus
    id
    name
    number
    processedAt
    totalPrice {
      amount
      currencyCode
    }
  }
`);

export const ORDER_FRAGMENT = gql(
  `#graphql
  fragment OrderFields on Order {
    ...OrderSummaryFields
    lineItems(first: 50) {
      nodes {
        id
        image {
          altText
          height
          url
          width
        }
        productId
        quantity
        title
        totalPrice {
          amount
          currencyCode
        }
        variantId
        variantOptions {
          name
          value
        }
        variantTitle
      }
    }
    returnInformation {
      nonReturnableSummary {
        nonReturnableReasons
      }
      returnableLineItems(first: 50) {
        nodes {
          lineItem {
            id
          }
          quantity
        }
      }
    }
    returns(first: 10) {
      nodes {
        ...ReturnSummaryFields
      }
    }
    shippingAddress {
      ...AddressFields
    }
    statusPageUrl
    subtotal {
      amount
      currencyCode
    }
    totalShipping {
      amount
      currencyCode
    }
    totalTax {
      amount
      currencyCode
    }
  }
`,
  [ADDRESS_FRAGMENT, ORDER_SUMMARY_FRAGMENT, RETURN_SUMMARY_FRAGMENT],
);
