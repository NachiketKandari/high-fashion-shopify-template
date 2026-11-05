"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const FIELD_CLASS =
  "rounded-none border-0 border-b border-input px-0 text-sm font-light tracking-wide focus-visible:ring-0";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="grid gap-3 border border-rule p-6" role="status">
        <p className="text-2xs uppercase tracking-wider">Message received</p>
        <p className="text-sm font-light leading-[22px] tracking-wide text-muted-foreground">
          Thank you for writing to us. The team replies within one working day. For urgent order
          questions, call or WhatsApp +91 89760 64836.
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
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label className="text-2xs uppercase tracking-wider" htmlFor="contact-name">
            Name
          </Label>
          <Input className={FIELD_CLASS} id="contact-name" name="name" required />
        </div>
        <div className="grid gap-2">
          <Label className="text-2xs uppercase tracking-wider" htmlFor="contact-email">
            Email *
          </Label>
          <Input className={FIELD_CLASS} id="contact-email" name="email" required type="email" />
        </div>
        <div className="grid gap-2">
          <Label className="text-2xs uppercase tracking-wider" htmlFor="contact-phone">
            Phone
          </Label>
          <Input className={FIELD_CLASS} id="contact-phone" name="phone" type="tel" />
        </div>
        <div className="grid gap-2">
          <Label className="text-2xs uppercase tracking-wider" htmlFor="contact-order">
            Order number
          </Label>
          <Input className={FIELD_CLASS} id="contact-order" name="order" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label className="text-2xs uppercase tracking-wider" htmlFor="contact-message">
          Message *
        </Label>
        <Textarea
          className="min-h-28 rounded-none border-0 border-b border-input px-0 text-sm font-light tracking-wide focus-visible:ring-0"
          id="contact-message"
          name="message"
          required
        />
      </div>
      <Button
        className="h-10 w-fit rounded-none bg-foreground px-8 text-2xs uppercase tracking-wider text-background hover:bg-foreground/90"
        type="submit"
      >
        Send message
      </Button>
    </form>
  );
}
