"use client";

import { type FormEvent, useState } from "react";

import { Link } from "@/components/ui/link";

interface NewsletterFormProps {
  className?: string;
  inputId: string;
  variant?: "inline" | "swipe";
}

export function NewsletterForm({ className, inputId, variant = "inline" }: NewsletterFormProps) {
  const [status, setStatus] = useState<"idle" | "unavailable">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("unavailable");
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="relative flex items-center gap-3 border-b border-ink pb-1.5 focus-within:after:absolute focus-within:after:inset-x-0 focus-within:after:-bottom-px focus-within:after:h-0.5 focus-within:after:bg-ink focus-within:after:content-['']">
        <label className="sr-only" htmlFor={inputId}>
          Your e-mail
        </label>
        <input
          autoComplete="email"
          className="type-body-sm h-9 min-w-0 flex-1 border-0 bg-transparent px-0 text-ink placeholder:text-ink-muted focus-visible:outline-none"
          id={inputId}
          name="email"
          placeholder="Your e-mail"
          required
          type="email"
        />
        {variant === "inline" ? (
          <button
            className="type-label focus-ring flex h-9 shrink-0 items-center px-1"
            type="submit"
          >
            Subscribe
          </button>
        ) : null}
      </div>
      {variant === "swipe" ? (
        <button
          className="type-label focus-ring group relative mt-3 flex h-10 w-full cursor-pointer items-center justify-center overflow-hidden border border-ink bg-paper text-ink transition-colors duration-(--motion-base) ease-(--ease-standard) hover:text-inverse"
          type="submit"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 origin-left scale-x-0 bg-ink transition-transform duration-(--motion-base) ease-(--ease-standard) group-hover:scale-x-100"
          />
          <span className="relative">Subscribe</span>
        </button>
      ) : null}
      <p className="type-body-sm pt-3 text-ink-muted">
        By subscribing, you agree to our{" "}
        <Link
          className="focus-ring underline underline-offset-2 transition-colors hover:text-ink"
          href="/pages/privacy-policies"
        >
          Privacy Policy
        </Link>
        .
      </p>
      {status === "unavailable" ? (
        <p className="type-body-sm pt-3 text-ink-muted" role="status">
          Newsletter signup is not available yet.
        </p>
      ) : null}
    </form>
  );
}
