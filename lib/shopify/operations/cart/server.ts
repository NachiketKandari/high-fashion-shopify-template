import { gql, type StorefrontClient } from "@shopify/hydrogen";

import type { CommerceLocale } from "@/lib/config/types";

const GET_CART_BUYER_IDENTITY_QUERY = gql(/* GraphQL */ `
  query getCartBuyerIdentity($id: ID!) {
    cart(id: $id) {
      buyerIdentity {
        countryCode
      }
    }
  }
`);

const CART_BUYER_IDENTITY_UPDATE_MUTATION = gql(/* GraphQL */ `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      userErrors {
        field
        message
      }
    }
  }
`);

export async function fetchCartBuyerIdentity(
  storefrontClient: StorefrontClient,
  cartId: string,
): Promise<{ countryCode: CommerceLocale["country"] | null } | undefined> {
  const { data, errors } = await storefrontClient.graphql(GET_CART_BUYER_IDENTITY_QUERY, {
    variables: { id: cartId },
  });
  if (errors?.length) return undefined;
  return data?.cart?.buyerIdentity ?? undefined;
}

export async function updateCartBuyerIdentity(
  storefrontClient: StorefrontClient,
  cartId: string,
  countryCode: CommerceLocale["country"],
): Promise<string | undefined> {
  const { data, errors } = await storefrontClient.graphql(CART_BUYER_IDENTITY_UPDATE_MUTATION, {
    variables: { buyerIdentity: { countryCode }, cartId },
  });
  return errors?.[0]?.message ?? data?.cartBuyerIdentityUpdate?.userErrors[0]?.message;
}
