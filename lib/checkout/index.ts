import type { CustomerAddress, CustomerAddressInput } from "@/lib/customer/types";

import type { DeliveryDraft, DeliveryErrors, DeliverySelection } from "./types";

export const GIFT_ATTRIBUTE = "gift";
export const GIFT_NOTE_ATTRIBUTE = "gift_note";
export const DELIVERY_COUNTRY_CODE = "IN";

export const EMPTY_DELIVERY_DRAFT: DeliveryDraft = {
  address1: "",
  address2: "",
  city: "",
  email: "",
  name: "",
  phone: "",
  postcode: "",
};

const REQUIRED_FIELDS: Array<keyof DeliveryDraft> = [
  "address1",
  "city",
  "email",
  "name",
  "phone",
  "postcode",
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const INDIAN_POSTCODE = /^\d{6}$/;

export const DELIVERY_FIELDS = [
  { autoComplete: "name", key: "name", label: "Name", placeholder: "Name" },
  { autoComplete: "email", key: "email", label: "Email", placeholder: "Email" },
  { autoComplete: "tel-national", key: "phone", label: "Mobile", placeholder: "Mobile" },
  {
    autoComplete: "address-line1",
    key: "address1",
    label: "Address line 1",
    placeholder: "Address line 1",
  },
  {
    autoComplete: "address-line2",
    key: "address2",
    label: "Address line 2",
    placeholder: "Address line 2",
  },
  { autoComplete: "postal-code", key: "postcode", label: "Postcode", placeholder: "Postcode" },
  { autoComplete: "address-level2", key: "city", label: "Town/City", placeholder: "Town/City" },
] as const satisfies ReadonlyArray<{
  autoComplete: string;
  key: keyof DeliveryDraft;
  label: string;
  placeholder: string;
}>;

export function getInitialDelivery(addresses: CustomerAddress[]): DeliverySelection {
  return {
    addressId: addresses[0]?.id ?? null,
    draft: EMPTY_DELIVERY_DRAFT,
    mode: addresses.length > 0 ? "saved" : "new",
  };
}

export function getDeliveryErrors(selection: DeliverySelection): DeliveryErrors {
  if (selection.mode === "saved") {
    return selection.addressId ? {} : { address1: "Choose a delivery address" };
  }

  const errors: DeliveryErrors = {};
  const { draft } = selection;
  for (const field of REQUIRED_FIELDS) {
    if (!draft[field].trim()) errors[field] = "Required";
  }
  if (!errors.email && !EMAIL.test(draft.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  if (!errors.phone && !INDIAN_MOBILE.test(draft.phone.trim())) {
    errors.phone = "Enter a 10-digit mobile number";
  }
  if (!errors.postcode && !INDIAN_POSTCODE.test(draft.postcode.trim())) {
    errors.postcode = "Enter a 6-digit pincode";
  }
  return errors;
}

export function getAddressSummary(address: CustomerAddress): string[] {
  if (address.formatted.length > 0) return address.formatted;
  return [address.address1, address.address2, address.city, address.zip].filter(
    (line): line is string => Boolean(line),
  );
}

export function toCustomerAddressInput(draft: DeliveryDraft): CustomerAddressInput {
  const [firstName = "", ...rest] = draft.name.trim().split(/\s+/);
  const address2 = draft.address2.trim();
  const lastName = rest.join(" ");

  return {
    address1: draft.address1.trim(),
    ...(address2 ? { address2 } : {}),
    city: draft.city.trim(),
    countryCode: DELIVERY_COUNTRY_CODE,
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    phoneNumber: `+91${draft.phone.trim()}`,
    zip: draft.postcode.trim(),
  };
}
