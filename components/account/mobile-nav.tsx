import { ACCOUNT_LINKS } from "./links";
import { MobileMenuClient } from "./mobile-menu-client";
import { SignOutButton } from "./sign-out-button";

export function AccountMobileNav() {
  return <MobileMenuClient links={ACCOUNT_LINKS} signOut={<SignOutButton variant="menu" />} />;
}
