import type { AccountLink } from "./links";
import { SidebarClient } from "./sidebar-client";

export function AccountSidebar({ links }: { links: AccountLink[] }) {
  return <SidebarClient links={links} />;
}
