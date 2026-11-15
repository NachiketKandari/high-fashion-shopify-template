export type ServiceabilityStatus = "serviceable" | "unserviceable" | "unverified";

export interface ServiceabilityResult {
  pincode: string;
  status: ServiceabilityStatus;
}
