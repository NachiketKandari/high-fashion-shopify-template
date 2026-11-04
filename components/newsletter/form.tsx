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
      <div className="flex items-center gap-3 border-b border-foreground pb-1.5">
        <label className="sr-only" htmlFor={inputId}>
          Your e-mail
        </label>
        <input
          autoComplete="email"
          className="min-w-0 flex-1 bg-transparent text-2xs tracking-wider placeholder:text-foreground/60 focus:outline-none"
          id={inputId}
          name="email"
          placeholder="Your e-mail"
          required
          type="email"
        />
        <button className="shrink-0 text-2xs uppercase tracking-wider" type="submit">
          Subscribe
        </button>
      </div>
    </form>
  );
}
