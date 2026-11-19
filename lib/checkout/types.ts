export interface DeliveryDraft {
  address1: string;
  address2: string;
  city: string;
  email: string;
  name: string;
  phone: string;
  postcode: string;
}

export interface DeliverySelection {
  addressId: string | null;
  draft: DeliveryDraft;
  mode: "new" | "saved";
}

export type DeliveryErrors = Partial<Record<keyof DeliveryDraft, string>>;
