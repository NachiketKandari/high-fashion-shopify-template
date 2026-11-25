export const REQUEST_ID_HEADER = "x-request-id";

const OPERATION_SEQUENCE_LIMIT = 0xffffffff;

const REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

let operationSequence = 0;

export function isRequestId(value: string | undefined | null): value is string {
  return typeof value === "string" && REQUEST_ID_PATTERN.test(value);
}

/**
 * A process-local ID is enough to correlate background Shopify calls that run before or outside a
 * browser request, including cached catalog reads.
 */
export function createOperationId(scope: string): string {
  operationSequence = (operationSequence + 1) % OPERATION_SEQUENCE_LIMIT;
  const timestamp = Math.round(performance.timeOrigin + performance.now()).toString(36);
  return `${scope}-${timestamp}-${operationSequence.toString(36)}`;
}

export function getPathname(url: string): string {
  try {
    return new URL(url, "http://localhost").pathname;
  } catch {
    return "/";
  }
}
