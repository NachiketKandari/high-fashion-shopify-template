import { NAV_CHIP_CLASS } from "@/components/nav/nav-chip";
import { Link } from "@/components/ui/link";
import { isCustomerLoggedIn } from "@/lib/auth/server";

const ACCOUNT_CLASS = `${NAV_CHIP_CLASS} hidden desktop:flex`;

export async function NavAccount() {
  const loggedIn = await isCustomerLoggedIn();
  if (!loggedIn) {
    return (
      // oxlint-disable-next-line next/no-html-link-for-pages -- Sign-in must be a full document navigation that is never prefetched, because the proxy starts OAuth.
      <a className={ACCOUNT_CLASS} href="/account/login">
        Account
      </a>
    );
  }
  return (
    <Link className={ACCOUNT_CLASS} href="/account">
      Account
    </Link>
  );
}

export function NavAccountFallback() {
  return (
    <span className={ACCOUNT_CLASS} aria-hidden="true">
      Account
    </span>
  );
}
