import { UserRound, UserRoundPlus } from "lucide-react";

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
        <Link aria-label="Account" className={MOBILE_ACCOUNT_CLASS} href="/login">
          <UserRoundPlus className="size-6" strokeWidth={1.5} />
        </Link>
        <Link className={ACCOUNT_CLASS} href="/login">
          Account
        </Link>
      </>
    );
  }
  return (
    <>
      <Link aria-label="Account" className={MOBILE_ACCOUNT_CLASS} href="/account">
        <UserRound className="size-6" strokeWidth={1.5} />
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
        <UserRoundPlus className="size-6" strokeWidth={1.5} />
      </span>
      <span aria-hidden="true" className={ACCOUNT_CLASS}>
        Account
      </span>
    </>
  );
}
