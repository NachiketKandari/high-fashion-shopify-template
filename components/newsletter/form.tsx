"use client";

import { type FormEvent, useState } from "react";

interface NewsletterFormProps {
  className?: string;
  inputId: string;
}

export function NewsletterForm({ className, inputId }: NewsletterFormProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className={className} role="status">
        Thank you. You are on the list.
      </p>
    );
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 border-b border-ink pb-1.5">
        <label className="sr-only" htmlFor={inputId}>
          Your e-mail
        </label>
        <input
          autoComplete="email"
          className="type-body-sm h-9 min-w-0 flex-1 border-0 bg-transparent px-0 tracking-[0.05em] text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
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
    </form>
  );
}
