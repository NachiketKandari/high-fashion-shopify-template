import type { ServiceabilityResult } from "./types";

// TODO(serviceability): Shiprocket's serviceability lookup replaces this stub; see docs/STUBS.md.
export function checkServiceability(pincode: string): ServiceabilityResult {
  return { pincode, status: "unverified" };
}

export function isServiceabilityVerified(result: ServiceabilityResult): boolean {
  return result.status !== "unverified";
}
