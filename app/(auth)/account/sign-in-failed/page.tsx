import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Sign-in failed",
};

export default function SignInFailedPage() {
  if (!shopConfig.auth.isEnabled) notFound();

  return (
    <Page className="flex flex-1 flex-col">
      <Container className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="grid max-w-xl gap-3">
          <h1 className="type-h2">Sign-in failed</h1>
          <p className="type-body-sm text-ink-muted">
            Your sign-in didn’t finish. Try again, or keep shopping without an account.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Button className="bg-ink-strong hover:bg-ink-strong/80" render={<Link href="/login" />}>
            Try again
          </Button>
          <Button render={<Link href="/" />} variant="outline">
            Continue shopping
          </Button>
        </div>
      </Container>
    </Page>
  );
}
