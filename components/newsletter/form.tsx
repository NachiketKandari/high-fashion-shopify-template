"use client";

import { type FormEvent, useState } from "react";

interface NewsletterFormProps {
  className?: string;
  inputId: string;
}

export function NewsletterForm({ className, inputId }: NewsletterFormProps) {
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
        <button className="type-label focus-ring flex h-9 shrink-0 items-center px-1" type="submit">
          Subscribe
        </button>
      </div>
      {status === "unavailable" ? (
        <p className="type-body-sm pt-3 text-ink-muted" role="status">
          Newsletter signup is not available yet.
        </p>
      ) : null}
    </form>
  );
}
