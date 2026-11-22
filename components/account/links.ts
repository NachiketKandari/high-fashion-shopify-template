export interface AccountLink {
  href: string;
  label: string;
}

export const ACCOUNT_LINKS: AccountLink[] = [
  { href: "/account/orders", label: "My orders" },
  { href: "/account/addresses", label: "Saved addresses" },
  { href: "/account/profile", label: "Profile details" },
  { href: "/pages/wishlist", label: "Private wishlist" },
];

export function isAccountLinkActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
