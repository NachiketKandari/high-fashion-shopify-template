import { gql } from "@shopify/hydrogen/customer-account";

export const STORE_CREDIT_ACCOUNT_FRAGMENT = gql(`#graphql
  fragment StoreCreditAccountFields on StoreCreditAccount {
    id
    balance {
      amount
      currencyCode
    }
    transactions(first: 50, reverse: true, sortKey: CREATED_AT) {
      nodes {
        __typename
        amount {
          amount
          currencyCode
        }
        balanceAfterTransaction {
          amount
          currencyCode
        }
        createdAt
        event
        origin {
          ... on OrderTransaction {
            order {
              id
              name
            }
          }
        }
      }
    }
  }
`);
