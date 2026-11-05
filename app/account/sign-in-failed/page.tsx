import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
      <Container className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center gap-2.5 text-center">
          <h1 className="type-display">Sign-in failed</h1>
          <p className="type-body max-w-xl text-ink-muted">
            Your sign-in didn’t finish. Try again, or keep shopping without an account.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {/* oxlint-disable-next-line next/no-html-link-for-pages -- Sign-in must be a full document navigation so the proxy can start OAuth. */}
            <a
              href="/account/login"
              className="type-control focus-ring inline-flex h-9 cursor-pointer items-center justify-center bg-ink px-8 text-inverse transition-colors hover:bg-ink/80"
            >
              Try again
            </a>
            <Link
              href="/"
              className="type-control focus-ring inline-flex h-9 cursor-pointer items-center justify-center border border-ink px-8 transition-colors hover:bg-surface"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </Container>
    </Page>
  );
}
