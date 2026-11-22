import { gql } from "@shopify/hydrogen/customer-account";

export const RETURN_REASON_FRAGMENT = gql(`#graphql
  fragment ReturnReasonFields on ReturnReasonDefinition {
    deleted
    handle
    id
    name
  }
`);

export const RETURN_SUMMARY_FRAGMENT = gql(`#graphql
  fragment ReturnSummaryFields on Return {
    createdAt
    id
    name
    status
    updatedAt
  }
`);

export const RETURNABLE_LINE_ITEM_FRAGMENT = gql(
  `#graphql
  fragment ReturnableLineItemFields on ReturnableLineItem {
    quantity
    lineItem {
      id
      image {
        altText
        height
        url
        width
      }
      name
      productId
      presentmentTitle
      suggestedReturnReasonDefinitions(first: 20) {
        nodes {
          ...ReturnReasonFields
        }
      }
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
`,
  [RETURN_REASON_FRAGMENT],
);

export const RETURN_REVERSE_DELIVERY_FRAGMENT = gql(`#graphql
  fragment ReturnReverseDeliveryFields on ReverseDelivery {
    customerGeneratedLabel
    deliverable {
      ... on ReverseDeliveryShippingDeliverable {
        label {
          publicFileUrl
        }
        tracking {
          carrierName
          trackingNumber
          trackingUrl
        }
      }
    }
    id
  }
`);

export const RETURN_LINE_ITEM_FRAGMENT = gql(
  `#graphql
  fragment ReturnLineItemFields on ReturnLineItemType {
    id
    lineItem {
      id
      image {
        altText
        height
        url
        width
      }
      name
      productId
      presentmentTitle
      totalPrice {
        amount
        currencyCode
      }
      variantOptions {
        name
        value
      }
      variantId
      variantTitle
    }
    quantity
    returnReasonDefinition {
      ...ReturnReasonFields
    }
  }
`,
  [RETURN_REASON_FRAGMENT],
);

export const RETURN_EXCHANGE_LINE_ITEM_FRAGMENT = gql(`#graphql
  fragment ReturnExchangeLineItemFields on ExchangeLineItem {
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
    variantId
    variantSku
    variantTitle
  }
`);

export const RETURN_FRAGMENT = gql(
  `#graphql
  fragment ReturnFields on Return {
    closedAt
    createdAt
    exchangeLineItems(first: 10) {
      nodes {
        ...ReturnExchangeLineItemFields
      }
    }
    id
    name
    returnLineItems(first: 50) {
      nodes {
        ...ReturnLineItemFields
      }
    }
    reverseDeliveries(first: 10) {
      nodes {
        ...ReturnReverseDeliveryFields
      }
    }
    status
    updatedAt
  }
`,
  [RETURN_EXCHANGE_LINE_ITEM_FRAGMENT, RETURN_LINE_ITEM_FRAGMENT, RETURN_REVERSE_DELIVERY_FRAGMENT],
);

export const MONEY_BAG_FRAGMENT = gql(`#graphql
  fragment MoneyBagFields on MoneyBag {
    presentmentMoney {
      amount
      currencyCode
    }
  }
`);

export const CALCULATED_RETURN_LINE_ITEM_FRAGMENT = gql(
  `#graphql
  fragment CalculatedReturnLineItemFields on CalculatedReturnLineItem {
    lineItem {
      id
    }
    quantity
    subtotalSet {
      ...MoneyBagFields
    }
    totalTaxSet {
      ...MoneyBagFields
    }
  }
`,
  [MONEY_BAG_FRAGMENT],
);

export const CALCULATED_RETURN_FRAGMENT = gql(
  `#graphql
  fragment CalculatedReturnFields on CalculatedReturn {
    financialSummary {
      restockingFeeSubtotalSet {
        ...MoneyBagFields
      }
      returnShippingFeeSubtotalSet {
        ...MoneyBagFields
      }
      returnSubtotalSet {
        ...MoneyBagFields
      }
      returnTotalSet {
        ...MoneyBagFields
      }
      returnTotalTaxSet {
        ...MoneyBagFields
      }
    }
    returnLineItems(first: 50) {
      nodes {
        ...CalculatedReturnLineItemFields
      }
    }
  }
`,
  [CALCULATED_RETURN_LINE_ITEM_FRAGMENT],
);
