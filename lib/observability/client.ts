"use client";

const REPORTED_ERRORS = new WeakSet<Error>();

const MAX_DIGEST_LENGTH = 200;

const MAX_MESSAGE_LENGTH = 2_000;

const MAX_NAME_LENGTH = 200;

const MAX_PATH_LENGTH = 500;

export function reportClientError(error: Error & { digest?: string }): void {
  if (!error || REPORTED_ERRORS.has(error)) return;
  REPORTED_ERRORS.add(error);

  const body = JSON.stringify({
    ...(error.digest && { digest: error.digest.slice(0, MAX_DIGEST_LENGTH) }),
    message: error.message.slice(0, MAX_MESSAGE_LENGTH),
    ...(error.name && { name: error.name.slice(0, MAX_NAME_LENGTH) }),
    path: window.location.pathname.slice(0, MAX_PATH_LENGTH),
  });

  fetch("/api/client-errors", {
    body,
    headers: { "content-type": "application/json" },
    keepalive: true,
    method: "POST",
  }).catch(() => {});
}
