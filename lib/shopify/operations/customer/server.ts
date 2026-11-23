import { type AnyCustomerAccountDocument, gql } from "@shopify/hydrogen/customer-account";
import type { CountryCode } from "@shopify/hydrogen/customer-account-api-types";
import { cache } from "react";

import { redirectToCustomerLogin, requireCustomerAccessToken } from "@/lib/auth/server";
import type {
  CustomerAddress,
  CustomerAddressInput,
  CustomerOrder,
  CustomerOrdersPage,
  CustomerProfile,
} from "@/lib/customer/types";
import type { Money } from "@/lib/money/types";
import type { ReturnContext, ReturnEstimate, ReturnRequestDetail } from "@/lib/returns/types";
import {
  customerAccountFetch,
  isCustomerAccountUnauthorized,
} from "@/lib/shopify/customer-account/server";
import { CUSTOMER_PROFILE_FRAGMENT } from "@/lib/shopify/fragments/customer";
import { ADDRESS_FRAGMENT } from "@/lib/shopify/fragments/customer-address";
import { ORDER_FRAGMENT, ORDER_LIST_FRAGMENT } from "@/lib/shopify/fragments/customer-order";
import {
  CALCULATED_RETURN_FRAGMENT,
  RETURN_FRAGMENT,
  RETURN_SUMMARY_FRAGMENT,
  RETURNABLE_LINE_ITEM_FRAGMENT,
} from "@/lib/shopify/fragments/customer-return";
import type {
  CustomerFetchOptions,
  CustomerUserError,
} from "@/lib/shopify/operations/customer/types";
import {
  transformCustomerAddress,
  transformCustomerProfile,
  transformOrder,
  transformOrderListRow,
} from "@/lib/shopify/transforms/customer";
import {
  transformReturnContext,
  transformReturnEstimate,
  transformReturnRequestDetail,
} from "@/lib/shopify/transforms/returns";
import type { CustomerAccountResultOf } from "@/lib/shopify/types";

const ORDERS_PER_PAGE = 10;

const GET_CUSTOMER_PROFILE_QUERY = gql(
  `#graphql
  query getCustomerProfile {
    customer {
      ...CustomerProfileFields
    }
  }
`,
  [CUSTOMER_PROFILE_FRAGMENT],
);

const GET_CUSTOMER_ORDERS_QUERY = gql(
  `#graphql
  query getCustomerOrders($after: String, $before: String, $first: Int, $last: Int) {
    customer {
      orders(after: $after, before: $before, first: $first, last: $last, reverse: true, sortKey: PROCESSED_AT) {
        nodes {
          ...OrderListFields
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
      }
    }
  }
`,
  [ORDER_LIST_FRAGMENT],
);

const GET_CUSTOMER_ORDER_QUERY = gql(
  `#graphql
  query getCustomerOrder($id: ID!) {
    order(id: $id) {
      ...OrderFields
    }
  }
`,
  [ORDER_FRAGMENT],
);

const GET_ORDER_RETURN_CONTEXT_QUERY = gql(
  `#graphql
  query getOrderReturnContext($id: ID!) {
    order(id: $id) {
      fulfillments(first: 20) {
        nodes {
          events(first: 20) {
            nodes {
              happenedAt
              status
            }
          }
          fulfillmentLineItems(first: 50) {
            nodes {
              lineItem {
                id
              }
            }
          }
        }
      }
      id
      lineItems(first: 50) {
        nodes {
          id
          totalPrice {
            amount
            currencyCode
          }
        }
      }
      name
      number
      returnInformation {
        nonReturnableSummary {
          nonReturnableReasons
        }
        returnShippingMethodNote
        returnableLineItems(first: 50) {
          nodes {
            ...ReturnableLineItemFields
          }
        }
      }
      returns(first: 20) {
        nodes {
          ...ReturnSummaryFields
        }
      }
      shippingAddress {
        ...AddressFields
      }
    }
  }
`,
  [ADDRESS_FRAGMENT, RETURNABLE_LINE_ITEM_FRAGMENT, RETURN_SUMMARY_FRAGMENT],
);

const GET_ORDER_RETURN_QUERY = gql(
  `#graphql
  query getOrderReturn($id: ID!) {
    order(id: $id) {
      id
      name
      number
      returns(first: 20) {
        nodes {
          ...ReturnFields
        }
      }
      shippingAddress {
        ...AddressFields
      }
    }
  }
`,
  [ADDRESS_FRAGMENT, RETURN_FRAGMENT],
);

const CALCULATE_RETURN_QUERY = gql(
  `#graphql
  query calculateReturn($input: CalculateReturnInput!) {
    returnCalculate(input: $input) {
      ...CalculatedReturnFields
    }
  }
`,
  [CALCULATED_RETURN_FRAGMENT],
);

const REQUEST_RETURN_MUTATION = gql(
  `#graphql
  mutation requestOrderReturn($orderId: ID!, $requestedLineItems: [RequestedLineItemInput!]!) {
    orderRequestReturn(orderId: $orderId, requestedLineItems: $requestedLineItems) {
      return {
        ...ReturnSummaryFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`,
  [RETURN_SUMMARY_FRAGMENT],
);

const GET_CUSTOMER_ADDRESSES_QUERY = gql(
  `#graphql
  query getCustomerAddresses {
    customer {
      addresses(first: 30) {
        nodes {
          ...AddressFields
        }
      }
      defaultAddress {
        id
      }
    }
  }
`,
  [ADDRESS_FRAGMENT],
);

const GET_CUSTOMER_STORE_CREDIT_QUERY = gql(`#graphql
  query getCustomerStoreCredit {
    customer {
      storeCreditAccounts(first: 10) {
        nodes {
          balance {
            amount
            currencyCode
          }
        }
      }
    }
  }
`);

const CUSTOMER_ADDRESS_CREATE_MUTATION = gql(`#graphql
  mutation customerAddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`);

const CUSTOMER_ADDRESS_UPDATE_MUTATION = gql(`#graphql
  mutation customerAddressUpdate($address: CustomerAddressInput, $addressId: ID!, $defaultAddress: Boolean) {
    customerAddressUpdate(address: $address, addressId: $addressId, defaultAddress: $defaultAddress) {
      customerAddress {
        id
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`);

const CUSTOMER_ADDRESS_DELETE_MUTATION = gql(`#graphql
  mutation customerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        code
        field
        message
      }
    }
  }
`);

const CUSTOMER_UPDATE_MUTATION = gql(`#graphql
  mutation customerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        firstName
        lastName
      }
      userErrors {
        field
        message
      }
    }
  }
`);

const ORDER_REQUEST_EDIT_MUTATION = gql(`#graphql
  mutation orderRequestEdit($orderId: ID!, $lineItems: RequestedOrderEditLineItemsInput!) {
    orderRequestEdit(orderId: $orderId, lineItems: $lineItems) {
      requestedOrderEdit {
        id
        status
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`);

async function customerFetch<const Doc extends AnyCustomerAccountDocument>({
  returnTo,
  ...options
}: CustomerFetchOptions<Doc>): Promise<CustomerAccountResultOf<Doc>> {
  const accessToken = await requireCustomerAccessToken(returnTo);
  try {
    return await customerAccountFetch<Doc>({ accessToken, ...options } as never);
  } catch (error) {
    // Shopify can revoke an access token before the stored session expires.
    if (isCustomerAccountUnauthorized(error)) redirectToCustomerLogin(returnTo);
    throw error;
  }
}

function toUserErrors(
  errors: Array<{ code?: string | null; field?: string[] | null; message: string }>,
): CustomerUserError[] {
  return errors.map((error) => ({
    code: error.code ?? undefined,
    field: error.field,
    message: error.message,
  }));
}

export const getCustomerProfile = cache(
  async (returnTo = "/account/profile"): Promise<CustomerProfile | null> => {
    const data = await customerFetch({
      document: GET_CUSTOMER_PROFILE_QUERY,
      operation: "getCustomerProfile",
      returnTo,
    });

    if (!data.customer) return null;

    return transformCustomerProfile(data.customer);
  },
);

export async function fetchCustomerOrders(cursor?: {
  after?: string;
  before?: string;
}): Promise<CustomerOrdersPage> {
  const paginateBackward = Boolean(cursor?.before);
  const orderParams = new URLSearchParams();
  if (cursor?.after) orderParams.set("after", cursor.after);
  if (cursor?.before) orderParams.set("before", cursor.before);
  const returnTo = `/account/orders${orderParams.size > 0 ? `?${orderParams}` : ""}`;

  const data = await customerFetch({
    document: GET_CUSTOMER_ORDERS_QUERY,
    operation: "getCustomerOrders",
    returnTo,
    variables: {
      after: cursor?.after,
      before: cursor?.before,
      first: paginateBackward ? undefined : ORDERS_PER_PAGE,
      last: paginateBackward ? ORDERS_PER_PAGE : undefined,
    },
  });

  const orders = data.customer?.orders;
  if (!orders) {
    return {
      orders: [],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
      },
    };
  }

  return {
    orders: orders.nodes.map(transformOrderListRow),
    pageInfo: {
      endCursor: orders.pageInfo.endCursor ?? null,
      hasNextPage: orders.pageInfo.hasNextPage,
      hasPreviousPage: orders.pageInfo.hasPreviousPage,
      startCursor: orders.pageInfo.startCursor ?? null,
    },
  };
}

export async function fetchCustomerOrder(id: string): Promise<CustomerOrder | null> {
  const data = await customerFetch({
    document: GET_CUSTOMER_ORDER_QUERY,
    operation: "getCustomerOrder",
    returnTo: `/account/orders/${encodeURIComponent(id)}`,
    variables: { id },
  });

  if (!data.order) return null;

  return transformOrder(data.order);
}

export async function fetchCustomerOrderReturnContext(
  orderId: string,
): Promise<ReturnContext | null> {
  const data = await customerFetch({
    document: GET_ORDER_RETURN_CONTEXT_QUERY,
    operation: "getOrderReturnContext",
    returnTo: `/returns/${encodeURIComponent(orderId)}`,
    variables: { id: orderId },
  });
  const order = data.order;
  if (!order) return null;

  return transformReturnContext({
    order: {
      fulfillments: order.fulfillments,
      id: order.id,
      lineItems: order.lineItems,
      name: order.name,
      number: order.number,
      returnInformation: {
        nonReturnableSummary: order.returnInformation.nonReturnableSummary ?? null,
        returnShippingMethodNote: order.returnInformation.returnShippingMethodNote ?? null,
      },
      returns: order.returns,
      shippingAddress: order.shippingAddress,
    },
    returnableItems: order.returnInformation.returnableLineItems.nodes,
  });
}

export async function calculateCustomerReturn(
  orderId: string,
  lineItems: Array<{ lineItemId: string; quantity: number }>,
): Promise<ReturnEstimate | null> {
  const data = await customerFetch({
    document: CALCULATE_RETURN_QUERY,
    operation: "calculateReturn",
    returnTo: `/returns/${encodeURIComponent(orderId)}`,
    variables: { input: { orderId, returnLineItems: lineItems } },
  });

  return data.returnCalculate ? transformReturnEstimate(data.returnCalculate) : null;
}

export async function requestCustomerReturn(
  orderId: string,
  lineItems: Array<{
    customerNote?: string;
    lineItemId: string;
    quantity: number;
    returnReasonDefinitionId?: string;
  }>,
): Promise<{
  errors: CustomerUserError[];
  request: { id: string; name: string; status: string } | null;
}> {
  const data = await customerFetch({
    document: REQUEST_RETURN_MUTATION,
    operation: "requestOrderReturn",
    returnTo: `/returns/${encodeURIComponent(orderId)}`,
    variables: { orderId, requestedLineItems: lineItems },
  });
  const payload = data.orderRequestReturn;

  return {
    errors: toUserErrors(payload?.userErrors ?? []),
    request: payload?.return ?? null,
  };
}

export async function fetchCustomerOrderReturnDetail(
  orderId: string,
  returnId: string,
): Promise<ReturnRequestDetail | null> {
  const data = await customerFetch({
    document: GET_ORDER_RETURN_QUERY,
    operation: "getOrderReturn",
    returnTo: `/returns/${encodeURIComponent(orderId)}/request/${encodeURIComponent(returnId)}`,
    variables: { id: orderId },
  });
  const order = data.order;
  const request = order?.returns.nodes.find((node) => node.id === returnId);
  if (!order || !request) return null;

  let estimate: ReturnEstimate | null = null;
  try {
    estimate = await calculateCustomerReturn(
      orderId,
      request.returnLineItems.nodes.map((item) => ({
        lineItemId: item.lineItem.id,
        quantity: item.quantity,
      })),
    );
  } catch {
    // A closed return can no longer be recalculated; the status page hides the estimate then.
  }

  return transformReturnRequestDetail({
    estimate,
    order: {
      id: order.id,
      name: order.name,
      number: order.number,
      shippingAddress: order.shippingAddress,
    },
    request,
  });
}

export async function requestCustomerOrderCancellation(
  orderId: string,
  removals: Array<{ lineItemId: string; quantity: number }>,
): Promise<{ errors: CustomerUserError[]; requestId: string | null }> {
  const data = await customerFetch({
    document: ORDER_REQUEST_EDIT_MUTATION,
    operation: "orderRequestEdit",
    returnTo: `/account/orders/${encodeURIComponent(orderId)}`,
    variables: {
      lineItems: {
        removals: removals.map((removal) => ({
          lineItemId: removal.lineItemId,
          quantity: removal.quantity,
        })),
      },
      orderId,
    },
  });

  const payload = data.orderRequestEdit;
  if (!payload)
    return { errors: [{ message: "Shopify returned no cancellation request." }], requestId: null };

  return {
    errors: toUserErrors(payload.userErrors ?? []),
    requestId: payload.requestedOrderEdit?.id ?? null,
  };
}

export async function fetchCustomerAddresses(): Promise<CustomerAddress[]> {
  const data = await customerFetch({
    document: GET_CUSTOMER_ADDRESSES_QUERY,
    operation: "getCustomerAddresses",
    returnTo: "/account/addresses",
  });

  if (!data.customer) return [];

  const defaultId = data.customer.defaultAddress?.id ?? null;
  const addresses = data.customer.addresses.nodes.map((address) =>
    transformCustomerAddress(address, defaultId),
  );

  return addresses.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

export async function fetchCustomerStoreCredit(): Promise<Money[]> {
  const data = await customerFetch({
    document: GET_CUSTOMER_STORE_CREDIT_QUERY,
    operation: "getCustomerStoreCredit",
    returnTo: "/checkout/address",
  });

  return data.customer?.storeCreditAccounts.nodes.map((account) => account.balance) ?? [];
}

// Shopify validates the code against its CountryCode enum and rejects unknown values.
function toShopifyAddressInput({ countryCode, ...address }: CustomerAddressInput) {
  return { ...address, countryCode: countryCode as CountryCode | undefined };
}

export async function createCustomerAddress(
  address: CustomerAddressInput,
  defaultAddress: boolean,
): Promise<CustomerUserError[]> {
  const data = await customerFetch({
    document: CUSTOMER_ADDRESS_CREATE_MUTATION,
    operation: "customerAddressCreate",
    returnTo: "/account/addresses",
    variables: { address: toShopifyAddressInput(address), defaultAddress },
  });

  return toUserErrors(data.customerAddressCreate?.userErrors ?? []);
}

export async function updateCustomerAddress(
  addressId: string,
  address: CustomerAddressInput,
  defaultAddress: boolean,
): Promise<CustomerUserError[]> {
  const data = await customerFetch({
    document: CUSTOMER_ADDRESS_UPDATE_MUTATION,
    operation: "customerAddressUpdate",
    returnTo: "/account/addresses",
    variables: { address: toShopifyAddressInput(address), addressId, defaultAddress },
  });

  return toUserErrors(data.customerAddressUpdate?.userErrors ?? []);
}

export async function deleteCustomerAddress(addressId: string): Promise<CustomerUserError[]> {
  const data = await customerFetch({
    document: CUSTOMER_ADDRESS_DELETE_MUTATION,
    operation: "customerAddressDelete",
    returnTo: "/account/addresses",
    variables: { addressId },
  });

  return toUserErrors(data.customerAddressDelete?.userErrors ?? []);
}

export async function updateCustomerProfile(input: {
  firstName: string;
  lastName: string;
}): Promise<CustomerUserError[]> {
  const data = await customerFetch({
    document: CUSTOMER_UPDATE_MUTATION,
    operation: "customerUpdate",
    returnTo: "/account/profile",
    variables: { input },
  });

  return toUserErrors(data.customerUpdate?.userErrors ?? []);
}
