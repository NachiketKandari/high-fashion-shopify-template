"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { shopConfig } from "@/lib/config";

const FIELD_CLASS = "type-body border-0 border-b border-input px-0";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="grid gap-3 border border-rule p-6" role="status">
        <p className="type-control">Message received</p>
        <p className="type-body text-ink-muted">
          Thank you for writing to us. The team replies within one working day. For urgent order
          questions, call or WhatsApp {shopConfig.site.contact.phone}.
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-6 tablet:grid-cols-2">
        <div className="grid gap-2">
          <Label className="type-label" htmlFor="contact-name">
            Name
          </Label>
          <Input className={FIELD_CLASS} id="contact-name" name="name" required />
        </div>
        <div className="grid gap-2">
          <Label className="type-label" htmlFor="contact-email">
            Email *
          </Label>
          <Input className={FIELD_CLASS} id="contact-email" name="email" required type="email" />
        </div>
        <div className="grid gap-2">
          <Label className="type-label" htmlFor="contact-phone">
            Phone
          </Label>
          <Input className={FIELD_CLASS} id="contact-phone" name="phone" type="tel" />
        </div>
        <div className="grid gap-2">
          <Label className="type-label" htmlFor="contact-order">
            Order number
          </Label>
          <Input className={FIELD_CLASS} id="contact-order" name="order" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label className="type-label" htmlFor="contact-message">
          Message *
        </Label>
        <Textarea
          className="type-body min-h-28 border-0 border-b border-input px-0"
          id="contact-message"
          name="message"
          required
        />
      </div>
      <Button
        className="type-control h-9 w-fit bg-ink px-8 text-inverse hover:bg-ink/80"
        type="submit"
      >
        Send message
      </Button>
    </form>
  );
}
