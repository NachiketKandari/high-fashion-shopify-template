import { gql } from "@shopify/hydrogen/customer-account";

export const CUSTOMER_PROFILE_FRAGMENT = gql(`#graphql
  fragment CustomerProfileFields on Customer {
    emailAddress {
      emailAddress
      marketingState
    }
    firstName
    lastName
    marketCurrencyCode
    phoneNumber {
      phoneNumber
    }
  }
`);
