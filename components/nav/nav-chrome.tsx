"use client";

import { type ReactNode, useState } from "react";

import { Header } from "./header";
import { SearchModal } from "./search-modal";

interface NavChromeProps {
  actions: ReactNode;
  mobileActions?: ReactNode;
  searchEnabled: boolean;
}

export function NavChrome({ actions, mobileActions, searchEnabled }: NavChromeProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <Header
      actions={actions}
      mobileActions={mobileActions}
      search={searchEnabled ? <SearchModal onOpenChange={setSearchOpen} open={searchOpen} /> : null}
      searchOpen={searchOpen}
    />
  );
}
