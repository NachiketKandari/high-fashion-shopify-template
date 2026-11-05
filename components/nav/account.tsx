import { UserRoundCheckIcon, UserRoundIcon } from "lucide-react";

import { Link } from "@/components/ui/link";
import { isCustomerLoggedIn } from "@/lib/auth/server";

const ACCOUNT_CLASS =
  "focus-ring flex size-9 shrink-0 items-center justify-center text-ink transition-opacity hover:opacity-60";

export async function NavAccount() {
  const loggedIn = await isCustomerLoggedIn();
  if (!loggedIn) {
    return (
      // oxlint-disable-next-line next/no-html-link-for-pages -- Sign-in must be a full document navigation that is never prefetched, because the proxy starts OAuth.
      <a aria-label="Sign in" className={ACCOUNT_CLASS} href="/account/login">
        <UserRoundIcon className="size-5" strokeWidth={1.25} />
      </a>
    );
  }
  return (
    <Link aria-label="Account" className={ACCOUNT_CLASS} href="/account">
      <UserRoundCheckIcon className="size-5" strokeWidth={1.25} />
    </Link>
  );
}

export function NavAccountFallback() {
  return (
    <span className="flex size-9 items-center justify-center text-ink">
      <UserRoundIcon className="size-5" strokeWidth={1.25} />
    </span>
  );
}
