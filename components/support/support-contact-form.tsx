"use client";

import { ChevronDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import { Textarea } from "@/components/ui/textarea";
import { shopConfig } from "@/lib/config";

const TOPICS = [
  "Orders & delivery",
  "Returns & alterations",
  "Sizing & fit",
  "Product care",
  "Something else",
];

const FIELD_CLASS = "h-11 border-ink";

export function SupportContactForm() {
  const [mailto, setMailto] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const sentRef = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mailto) {
      sentRef.current = true;
      statusRef.current?.focus();
      return;
    }
    if (sentRef.current) {
      sentRef.current = false;
      nameRef.current?.focus();
    }
  }, [mailto]);

  if (mailto) {
    return (
      <div
        className="focus-ring grid gap-4 border border-rule p-6"
        ref={statusRef}
        role="status"
        tabIndex={-1}
      >
        <p className="type-h4 text-ink">Your message is ready</p>
        <p className="type-body-sm text-ink-muted">
          This template does not send messages directly. Continue in your email app, or write to{" "}
          <Link
            className="focus-ring text-ink underline decoration-ink underline-offset-4"
            href={`mailto:${shopConfig.site.contact.email}`}
          >
            {shopConfig.site.contact.email}
          </Link>
          .
        </p>
        <div className="grid gap-3">
          <Button render={<a href={mailto} />} size="lg">
            Open in email
          </Button>
          <Button onClick={() => setMailto(null)} size="lg" variant="outline">
            Write another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = String(data.get("name") ?? "");
        const email = String(data.get("email") ?? "");
        const topic = String(data.get("topic") ?? "");
        const orderReference = String(data.get("orderReference") ?? "");
        const message = String(data.get("message") ?? "");
        const lines = [`Name: ${name}`, `Email: ${email}`, `Topic: ${topic}`];
        if (orderReference) lines.push(`Order reference: ${orderReference}`);
        lines.push("", message);
        setMailto(
          `mailto:${shopConfig.site.contact.email}?subject=${encodeURIComponent(
            `Support request: ${topic}`,
          )}&body=${encodeURIComponent(lines.join("\n"))}`,
        );
      }}
    >
      <div className="grid gap-2">
        <Label className="type-label" htmlFor="support-name">
          Your name <span aria-hidden="true">*</span>
        </Label>
        <Input
          autoComplete="name"
          className={FIELD_CLASS}
          id="support-name"
          name="name"
          placeholder="Your full name"
          ref={nameRef}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label className="type-label" htmlFor="support-email">
          Email address <span aria-hidden="true">*</span>
        </Label>
        <Input
          autoComplete="email"
          className={FIELD_CLASS}
          id="support-email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </div>
      <div className="grid gap-2">
        <Label className="type-label" htmlFor="support-topic">
          Topic <span aria-hidden="true">*</span>
        </Label>
        <div className="relative">
          <select
            className="type-body focus-ring h-11 w-full cursor-pointer appearance-none rounded-control border border-ink bg-transparent px-3 pr-10 text-ink transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue=""
            id="support-topic"
            name="topic"
            required
          >
            <option disabled value="">
              Choose a topic
            </option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
            strokeWidth={1.25}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label className="type-label" htmlFor="support-order">
          Order reference (optional)
        </Label>
        <Input
          autoComplete="off"
          className={FIELD_CLASS}
          id="support-order"
          name="orderReference"
          placeholder="Enter order reference"
        />
      </div>
      <div className="grid gap-2">
        <Label className="type-label" htmlFor="support-message">
          Message <span aria-hidden="true">*</span>
        </Label>
        <Textarea
          className="type-body min-h-28 border-ink"
          id="support-message"
          name="message"
          placeholder="How can I help?"
          required
        />
      </div>
      <p className="type-body-sm text-ink-muted">
        Please don’t include sensitive payment or sign-in information.
      </p>
      <Button size="lg" type="submit">
        Send Message
      </Button>
      <p className="type-body-sm text-ink-muted">
        By sending this message, you agree to the{" "}
        <Link
          className="focus-ring text-ink underline decoration-ink underline-offset-4"
          href="/pages/privacy-policies"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
