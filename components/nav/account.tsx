import { UserRound } from "lucide-react";

import { NAV_CHIP_CLASS } from "@/components/nav/nav-chip";
import { Link } from "@/components/ui/link";
import { isCustomerLoggedIn } from "@/lib/auth/server";

const ACCOUNT_CLASS = `${NAV_CHIP_CLASS} hidden desktop:flex`;
const MOBILE_ACCOUNT_CLASS =
  "focus-ring flex size-9 items-center justify-center text-ink desktop:hidden";

export async function NavAccount() {
  const loggedIn = await isCustomerLoggedIn();
  if (!loggedIn) {
    return (
      <>
        {/* oxlint-disable-next-line next/no-html-link-for-pages -- Sign-in must be a full document navigation that is never prefetched, because the proxy starts OAuth. */}
        <a aria-label="Account" className={MOBILE_ACCOUNT_CLASS} href="/account/login">
          <UserRound className="size-5" strokeWidth={1.25} />
        </a>
        {/* oxlint-disable-next-line next/no-html-link-for-pages -- Sign-in must be a full document navigation that is never prefetched, because the proxy starts OAuth. */}
        <a className={ACCOUNT_CLASS} href="/account/login">
          Account
        </a>
      </>
    );
  }
  return (
    <>
      <Link aria-label="Account" className={MOBILE_ACCOUNT_CLASS} href="/account">
        <UserRound className="size-5" strokeWidth={1.25} />
      </Link>
      <Link className={ACCOUNT_CLASS} href="/account">
        Account
      </Link>
    </>
  );
}

export function NavAccountFallback() {
  return (
    <>
      <span aria-hidden="true" className={MOBILE_ACCOUNT_CLASS}>
        <UserRound className="size-5" strokeWidth={1.25} />
      </span>
      <span aria-hidden="true" className={ACCOUNT_CLASS}>
        Account
      </span>
    </>
  );
}
