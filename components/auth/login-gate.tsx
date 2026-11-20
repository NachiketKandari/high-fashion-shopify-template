"use client";

import { ArrowRight, CircleAlert } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID_EMAIL_MESSAGE = "Please enter valid email";

function getReturnTo(): string | null {
  const value = new URLSearchParams(window.location.search).get("return_to");
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }
  if (value === "/login" || value.startsWith("/login?") || value.startsWith("/account/login")) {
    return null;
  }
  return value;
}

function getLoginPath(loginHint?: string): string {
  const params = new URLSearchParams({ return_to: getReturnTo() ?? "/account" });
  if (loginHint) {
    params.set("login_hint", loginHint);
    params.set("login_hint_mode", "submit");
  }
  return `/account/login?${params.toString()}`;
}

export function LoginGate() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setError(INVALID_EMAIL_MESSAGE);
      return;
    }
    window.location.assign(getLoginPath(value));
  }

  return (
    <>
      <form
        action="/account/login"
        className="grid gap-8"
        method="get"
        noValidate
        onSubmit={handleSubmit}
      >
        <input name="login_hint_mode" type="hidden" value="submit" />
        <div className="relative">
          <label className="sr-only" htmlFor="login-email">
            E-mail
          </label>
          <Input
            aria-describedby={error ? "login-email-error" : undefined}
            aria-invalid={error ? true : undefined}
            autoComplete="email"
            className="type-body-sm h-[49px] rounded-none border-0 border-b border-ink-strong bg-transparent px-0 py-4 focus-underline aria-invalid:border-ink-strong aria-invalid:bg-transparent"
            id="login-email"
            inputMode="email"
            name="login_hint"
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(null);
            }}
            placeholder="E-mail"
            type="email"
            value={email}
          />
          {error ? (
            <p
              className="type-body-sm absolute top-4 right-0 flex items-center gap-2 text-ink"
              id="login-email-error"
              role="alert"
            >
              <CircleAlert
                aria-hidden="true"
                className="size-4 fill-ink text-paper"
                strokeWidth={1.5}
              />
              {error}
            </p>
          ) : null}
        </div>
        <Button className="w-full bg-ink-strong hover:bg-ink-strong/80" type="submit">
          Proceed
        </Button>
      </form>

      <Link
        className="type-body-sm focus-ring flex h-12 w-fit items-center gap-3 text-ink-strong"
        href="/"
      >
        Continue as guest
        <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
      </Link>

      <Button
        className="h-10.5 w-full border-ink-strong text-ink-strong"
        onClick={() => window.location.assign(getLoginPath())}
        type="button"
        variant="outline"
      >
        Continue with Google
      </Button>
    </>
  );
}
