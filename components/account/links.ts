export interface AccountLink {
  exact?: boolean;
  href: string;
  label: string;
}

export const ACCOUNT_LINKS: AccountLink[] = [
  { exact: true, href: "/account", label: "Overview" },
  { href: "/account/orders", label: "My orders" },
  { href: "/account/wallet", label: "Account Balance" },
  { href: "/account/invoices", label: "Invoices & notes" },
  { href: "/account/addresses", label: "Saved addresses" },
  { href: "/account/profile", label: "Profile details" },
  { href: "/pages/wishlist", label: "Private wishlist" },
];

export function isAccountLinkActive(pathname: string, link: AccountLink): boolean {
  return link.exact ? pathname === link.href : pathname.startsWith(link.href);
}

export function getAccountPageLabel(pathname: string): string {
  return ACCOUNT_LINKS.find((link) => isAccountLinkActive(pathname, link))?.label ?? "Overview";
}
