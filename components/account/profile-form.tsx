"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import { getEmailMarketingStateLabel, isEmailMarketingSubscribed } from "@/lib/customer";
import { updateProfileAction } from "@/lib/customer/action";
import type { CustomerProfile } from "@/lib/customer/types";

import { AccountCard } from "./card";
import { SignOutButton } from "./sign-out-button";

export function ProfileForm({ profile }: { profile: CustomerProfile }) {
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [emailMarketing, setEmailMarketing] = useState(
    isEmailMarketingSubscribed(profile.emailMarketingState),
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateProfileAction({ emailMarketing, firstName, lastName });
      if (result.success) {
        setSaved(true);
      } else {
        setError(result.error ?? null);
      }
    });
  };

  const handleCancel = () => {
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setEmailMarketing(isEmailMarketingSubscribed(profile.emailMarketingState));
    setError(null);
    setSaved(false);
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <AccountCard className="grid gap-4">
          <h2 className="type-h4 text-ink">Personal details</h2>
          <p className="type-body-sm text-ink-muted">Fields marked * are required.</p>

          <div className="grid gap-4 desktop:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">
                First name <span aria-hidden="true">*</span>
              </Label>
              <Input
                autoComplete="given-name"
                id="firstName"
                name="firstName"
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setSaved(false);
                }}
                required
                value={firstName}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">
                Last name <span aria-hidden="true">*</span>
              </Label>
              <Input
                autoComplete="family-name"
                id="lastName"
                name="lastName"
                onChange={(event) => {
                  setLastName(event.target.value);
                  setSaved(false);
                }}
                required
                value={lastName}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">
              Email address <span aria-hidden="true">*</span>
            </Label>
            <Input autoComplete="email" disabled id="email" type="email" value={profile.email} />
            <p className="type-body-sm text-ink-muted">
              <Link
                className="underline underline-offset-4 hover:opacity-60"
                href="/pages/contact-us"
              >
                Contact us
              </Link>{" "}
              to change your email address.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phoneNumber">Mobile number</Label>
            <Input
              autoComplete="tel"
              disabled
              id="phoneNumber"
              type="tel"
              value={profile.phoneNumber ?? "Not provided"}
            />
            <p className="type-body-sm text-ink-muted">
              <Link
                className="underline underline-offset-4 hover:opacity-60"
                href="/pages/contact-us"
              >
                Contact us
              </Link>{" "}
              to update your mobile number.
            </p>
          </div>

          <hr className="border-rule" />

          <h2 className="type-h4 text-ink">Communication preferences</h2>
          <p className="type-body-sm text-ink-muted">
            Order and service messages are sent to your registered email.
          </p>
          <Checkbox
            checked={emailMarketing}
            label="Receive collection updates by email"
            onCheckedChange={(checked) => {
              setEmailMarketing(checked);
              setSaved(false);
            }}
          />
          <p className="type-body-sm text-ink-muted">
            {getEmailMarketingStateLabel(profile.emailMarketingState)}
          </p>

          {error ? (
            <p className="type-body-sm text-error-rule" role="alert">
              {error}
            </p>
          ) : null}
          {saved ? (
            <p className="type-body-sm text-ink-muted" role="status">
              Profile updated
            </p>
          ) : null}

          <div className="grid gap-3">
            <Button disabled={isPending} size="lg" type="submit">
              {isPending ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              disabled={isPending}
              onClick={handleCancel}
              size="lg"
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </AccountCard>
      </form>

      <section className="grid gap-4">
        <h2 className="type-h4 text-ink">Security</h2>
        <AccountCard className="grid gap-3">
          <p className="type-body-sm text-ink-muted">
            You sign in with a one-time code sent to your email. There is no password to manage.
          </p>
          <SignOutButton className="px-0" />
        </AccountCard>
      </section>

      <section className="grid gap-4">
        <h2 className="type-h4 text-ink">Privacy &amp; account requests</h2>
        <p className="type-body-sm text-ink-muted">Contact us for privacy or account requests.</p>
        <Link
          className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline underline-offset-4 hover:opacity-60"
          href="/pages/contact-us"
        >
          Contact us
        </Link>
      </section>
    </div>
  );
}
