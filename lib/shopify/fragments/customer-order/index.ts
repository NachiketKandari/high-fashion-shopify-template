import { gql } from "@shopify/hydrogen/customer-account";

import { ADDRESS_FRAGMENT } from "@/lib/shopify/fragments/customer-address";
import { RETURN_SUMMARY_FRAGMENT } from "@/lib/shopify/fragments/customer-return";

export const ORDER_SUMMARY_FRAGMENT = gql(`#graphql
  fragment OrderSummaryFields on Order {
    cancelledAt
    financialStatus
    fulfillmentStatus
    fulfillments(first: 2) {
      nodes {
        createdAt
        estimatedDeliveryAt
        latestShipmentStatus
        status
        trackingInformation {
          company
          number
          url
        }
        events(first: 10, reverse: true) {
          nodes {
            happenedAt
            status
          }
        }
      }
    }
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

export const ORDER_LIST_FRAGMENT = gql(
  `#graphql
  fragment OrderListFields on Order {
    ...OrderSummaryFields
    lineItems(first: 10) {
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
      pageInfo {
        hasNextPage
      }
    }
  }
`,
  [ORDER_SUMMARY_FRAGMENT],
);

export const ORDER_FRAGMENT = gql(
  `#graphql
  fragment OrderFields on Order {
    ...OrderSummaryFields
    cancelReason
    createdAt
    discountApplications(first: 10) {
      nodes {
        __typename
        value {
          __typename
          ... on MoneyV2 {
            amount
            currencyCode
          }
          ... on PricingPercentageValue {
            percentage
          }
        }
        ... on DiscountCodeApplication {
          code
        }
        ... on AutomaticDiscountApplication {
          title
        }
        ... on ManualDiscountApplication {
          description
          title
        }
        ... on ScriptDiscountApplication {
          title
        }
      }
    }
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
    paymentInformation {
      paymentStatus
      totalOutstandingAmount {
        amount
        currencyCode
      }
      totalPaidAmount {
        amount
        currencyCode
      }
    }
    refunds {
      createdAt
      id
      totalRefunded {
        amount
        currencyCode
      }
    }
    requestedEditInformation {
      editableLineItems(first: 50) {
        nodes {
          lineItem {
            id
          }
          quantity
        }
      }
      hasEditableLineItems
    }
    requestedOrderEdits(first: 5) {
      nodes {
        id
        status
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
    totalRefunded {
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
    transactions {
      createdAt
      giftCardDetails {
        last4
      }
      id
      kind
      processedAt
      status
      transactionAmount {
        presentmentMoney {
          amount
          currencyCode
        }
      }
      type
    }
  }
`,
  [ADDRESS_FRAGMENT, ORDER_SUMMARY_FRAGMENT, RETURN_SUMMARY_FRAGMENT],
);
