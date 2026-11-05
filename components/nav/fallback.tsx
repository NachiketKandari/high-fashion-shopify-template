import { Wordmark } from "@/components/brand/wordmark";

import { Announcement } from "./announcement";

export function NavFallback() {
  return (
    <>
      <Announcement />
      <header className="sticky top-0 z-50 h-(--header-bar-h)">
        <div className="bg-paper">
          <div className="border-y border-rule">
            <div className="flex h-(--header-bar-h) items-center px-(--gutter)">
              <Wordmark priority variant="compact" />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
